'use strict';
const http = require('http');
const WebSocket = require('ws');
const FileManager = require('./fileManager').FileManager;
const IDGenerator = require('./IDGenerator');
//const bundle = require('../exampleBundle.json');

const fileManager = new FileManager();
const idGenerator = new IDGenerator();

const routing = {
  '/': '/index.html'
}

const mime = {
  'html': 'text/html',
  'js': 'application/javascript',
  'css': 'text/css',
  'png': 'image/png',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'json': 'text/plain',
  'txt': 'text/plain',
};

//class server singleton
class Server {
  //saves {room: [id1, id2, .....]}
  _games = { 2000: [] };
  _users = {};

  constructor(port, database) {
    this.database = database;
    this._messageConfig = {
      'getAllBundles': data => this.getAllBundles(data),
      'messageToGameChat': data => this.messageToGameChat(data),

    };

    if (!Server._instance) {
      Server._instance = this;

      this.server = http.createServer();
      this.server.listen(port, () => console.log('Listening on port ' + port));
      this.server.on('request', this.handleRequest);
      const server = this.server;
      this.ws = new WebSocket.Server({ server });
      this.ws.on('connection', (connection, req) => {
        this.connectionOpen(connection, req);
        connection.on('message', m => this.connectionMessage(connection, m));
        connection.on('close', () => this.connectionClose(connection));
      });
    }
    return Server._instance;
  }

  //handles request to server
  async handleRequest(req, res) {
    let name = req.url;
    if (routing[name]) name = routing[name];
    let extention = name.split('.')[1];
    const typeAns = mime[extention];
    let data = null;
    data = await fileManager.readFile('.' + name);
    if (data) {
      res.writeHead(200, { 'Content-Type': `${typeAns}; charset=utf-8` });
      res.write(data);
    }
    res.end();
  }

  //on new user connected
  connectionOpen(connection, req) {
    let n = 0;
    this.ws.clients.forEach(() => n++);
    this.sendToAll({mType: 'usersOnline', data: n});
    const id = idGenerator.getID();
    this._users[id] = [connection, req.url.slice(11)];
    this._games[2000].push(id);
  }

  //send message to everyone
  sendToAll(message) {
    this.ws.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  //send to specific user 
  sendToUser(id, message) {
    const user = this._users[id][0];
    if (user.readyState === WebSocket.OPEN) {
      user.send(JSON.stringify(message));
    }
  }

  //executes specific function on new message from client
  async connectionMessage(connection, message) {
    const request = JSON.parse(message);
    const messageHandler = this._messageConfig[request.mType];
    console.log(request);
    if (!messageHandler) return;
    await messageHandler([this.getIdByConnection(connection), request.data]);
    //this.database.insertBundle(bundle);
  }

  //gets all bundles from database
  async getAllBundles(message) {
    const bundles = await this.database.getAllBundles();
    this.sendToUser(message[0], {mType: 'allBundles', data: bundles});
  }

  //sends message to everyone in game chat
  messageToGameChat(message) {
    const id = message[0];
    for (let userId of this._games[message[1].room]) {
      message[1].name = this._users[id][1];
      this.sendToUser(userId, {mType: 'messageToGameChat', data: message[1]});
    }
  }

  insertBundle(message) {
    console.log(message);
  }

  //executes on user quitting
  connectionClose(connection) {
    let n = 0;
    this.ws.clients.forEach(() => n++);
    this.sendToAll({mType: 'usersOnline', data: n});
  }

  // gets users id by connection
  getIdByConnection(connection) {
    for (let [id, info] of Object.entries(this._users)) {
      if (info[0] === connection) return id;
    }
  }
}

module.exports = { Server };
