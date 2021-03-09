'use strict';
const http = require('http');
const WebSocket = require('ws');
const FileManager = require('./fileManager').FileManager;
const IDGenerator = require('./IDGenerator');
//const bundleua = require('../exampleBundle_ua.json');
//const bundlede = require('../exampleBundle_de.json');

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
  _games = {};
  _users = {};

  constructor(port, database) {
    this.database = database;
    this._messageConfig = {
      'getAllBundles': data => this.getAllBundles(data),
      'messageToGameChat': data => this.messageToGameChat(data),
      'newGameLobby': data => this.createNewGame(data),
      'returnAllGames': data => this.returnAllGames(data),
      'joinGame': data => this.joinGame(data),
      'insertBundle': data => this.insertBundle(data),
      'broadcastInRoom': data => this.broadcastInRoom(data),
      'saveBundleToDB': data => this.saveBundleToDB(data),
      'leaveGame': data => this.leaveGame(data),
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
    this._users[id] = {connection: connection, name: req.url.slice(11)};
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
    console.log(this._users[id]);
    const user = this._users[id].connection;
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
    await messageHandler({ 
      'id': this.getIdByConnection(connection),
      'data': request.data,
    });
    //this.database.insertBundle(bundleua);
    //this.database.insertBundle(bundlede);
  }

  //gets all bundles from database
  async getAllBundles(message) {
    const bundles = await this.database.getAllBundles();
    this.sendToUser(message.id, {mType: 'allBundles', data: bundles});
  }

  //sends message to everyone in game chat
  messageToGameChat(message) {
    const data = message.data;
    const id = message.id;
    data.name = this._users[id].name;
    for (let userId of this._games[data.room].players) {
      this.sendToUser(userId, {mType: 'messageToGameChat', data: data });
    }
  }

  //games to send to client 
  prepareGamesForClient() {
    const gamesSend = Object.assign({}, this._games);
    console.log('objects ', this._games, gamesSend);
    for (let j in gamesSend) {
      const players = gamesSend[j].players;
      for (let i in players) {
        gamesSend[j].players[i].connection = null;
      }
    }
    return gamesSend;
  }

  //creates new game and puts it to games
  createNewGame(data) {
    const message = data.data;
    const id = idGenerator.getID();
    this._games[id] = {
      players: {},
    };
    this._games[id].players[data.id] = this._users[data.id];
    this._games[id].bundle = message.bundle;
    this._games[id].settings = message.settings;
    this.sendToUser(data.id, {mType: 'newLobbyId', data: {id: id}});
    for (let id of Object.keys(this._users)) {
      this.returnAllGames({id: id});
    }
    console.log(this._games);
  }

  //returns all games
  returnAllGames(data) {
    const id = data.id;
    const gamesSend = this.prepareGamesForClient();
    this.sendToUser(id, {mType: 'returnAllGames', data: gamesSend});
  }

  //on user leaves game
  leaveGame(data) {
    console.log(data)
    const id = data.id;
    const roomID = data.data.roomID;
    const players = this._games[roomID].players;
    delete players[id];
    //remove comments on production
    //if (this._games[roomID].players.length === 0) {
    //  delete this._games[roomID];
    //  idGenerator.removeID(roomID);
    //}
    this.returnAllGames({id: id});
  }

  //broadcast for all people in room
  broadcastInRoom(data) {
    const roomID = data.data.roomID;
    const players = this._games[roomID].players;
    for (let player in players) {
      this.sendToUser(player, {mType: 'broadcastedEvent', data: data});
    }
    
  }

  // in {mType: , data: {id: , }}
  // returns nothing yet
  joinGame(data) {
    const id = data.id;
    const message = data.data;
    this._games[message.id].players[id] = this._users[id];
    const gamesSend = this.prepareGamesForClient();
    this.sendToAll({mType: 'returnAllGames', data: gamesSend});
    const gameData = this._games[message.id];
    for (let player in gameData.players) {
      this.sendToUser(player, {mType: 'newJoin', data: {id: id, name: gameData.players[player]}});
    }
    this.sendToUser(id, {mType: 'joinGame', data: {id: message.id}});
  }

  //saves bundle to db
  saveBundleToDB(data) {
    this.database.insertBundle(data.data);
  }

  //inserts bundle to database
  insertBundle(message) {
    this.database.insertBundle(message.bundle);
  }

  //executes on user quitting
  connectionClose(connection) {
    let n = 0;
    this.ws.clients.forEach(() => n++);
    this.sendToAll({mType: 'usersOnline', data: n});
    const id = this.getIdByConnection(connection);
    for (let idGame in this._games) {
      const game = this._games[idGame];
      const players = game.players;
      if (players.hasOwnProperty(id)) this.leaveGame({id: id, data: {roomID: idGame}})
    }
    delete this._users[id];
    idGenerator.removeID(id);
  }

  // gets users id by connection
  getIdByConnection(connection) {
    for (let [id, info] of Object.entries(this._users)) {
      if (info.connection === connection) return id;
    }
  }
}

module.exports = { Server };
