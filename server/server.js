'use strict';

const http = require('http');
const WebSocket = require('ws');
const FileManager = require('./fileManager').FileManager;
const IDGenerator = require('./IDGenerator');
const Database = require('../database/database').Database;
const databaseConfig = require('../database/database.config.json');

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
  _messageConfig = {
    'getAllBundles': data => this.getAllBundles(data),
    'messageToGameChat': data => this.messageToGameChat(data),
    'newGameLobby': data => this.createNewGame(data),
    'returnAllGames': data => this.returnAllGames(data),
    'joinGame': data => this.joinGame(data),
    'broadcastInRoom': data => this.broadcastInRoom(data),
    'saveBundleToDB': data => this.saveBundleToDB(data),
    'leaveGame': data => this.leaveGame(data),
    'newGameMaster': data => this.newGameMaster(data),
    'sendName': data => this.sendName(data),
    'removeUserFromServer': data => this.removeUserFromServer(data),
    'updateGameStatus': data => this.updateGameStatus(data),
    'getBundleNames': data => this.getBundleNames(data),
    'getBundleByName': data => this.getBundleByName(data),
  };

  constructor(port) {
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

  updateGameStatus(data) {
    const roomId = data.data.roomID;
    this._games[roomId].settings.running = true;
    const gamesSend = this.prepareGamesForClient();
    this.sendToAll({mType: 'returnAllGames', data: gamesSend});
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
    const id = idGenerator.getID();
    this._users[id] = {connection: connection, name: ''};
  }

  //write into this._users name
  sendName(data) {
    if (!this._users.hasOwnProperty(data.id)) {
      console.log('(sendName) no such id property in this._users: ', data.id);
      return;
    }
    if (!data.data.hasOwnProperty('name')) {
      console.log('(sendName) no name property in data.data: ', data);
      return;
    }
    this._users[data.id].name = data.data.name;
    const users = {names: []};
    for (let i in this._users) {
      users.names.push(this._users[i].name);
    }
    this.sendToAll({mType: 'usersOnline', data: users});
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
    if (!this._users.hasOwnProperty(id) || !this._users[id].hasOwnProperty('connection')) {
      console.log(('(sendToUser) user with id: ' + id + ' probably left before answer arrived'));
      return;
    }
    const user = this._users[id].connection;
    if (user.readyState === WebSocket.OPEN) {
      user.send(JSON.stringify(message));
    }
  }

  //executes specific function on new message from client
  async connectionMessage(connection, message) {
    const request = JSON.parse(message);
    console.log('request ', request);
    if (!this._messageConfig.hasOwnProperty(request.mType)) {
      console.log('(connectionMessage) should exist mType, wrong input: ', request);
      return;
    }
    const messageHandler = this._messageConfig[request.mType];
    if (!messageHandler) {
      console.log('(connectionMessage) no handle exists for mType: ' + request.mType);
      return;
    }
    await messageHandler({ 
      'id': this.getIdByConnection(connection),
      'data': request.data,
    });
  }

  //gets all bundles from database
  getAllBundles(message) {
    const database = new Database(databaseConfig);
    const connection = database.returnConnection();
    connection.connect( async err => {
      if (err) throw err;
      console.log("Connected!");
      let bundles = null;
      try {
        bundles = await database.getAllBundles();
      } catch (err) {
        console.log(('(getAllBundles) error when awaiting bundles from db occured ', err));
      }
      this.sendToUser(message.id, {mType: 'allBundles', data: bundles});
      connection.destroy();
    });
    
  }

  //sends message to everyone in game chat
  messageToGameChat(message) {
    const data = message.data;
    const id = message.id;
    data.name = this._users[id].name;
    for (let userId in this._games[data.room].players) {
      this.sendToUser(userId, {mType: 'messageToGameChat', data: data });
    }
  }

  //games to send to client 
  prepareGamesForClient() {
    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (k, val) => {
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) {
            return;
          }
          seen.add(val);
        }
        return val;
      };
    }
    const gamesSend = JSON.parse(JSON.stringify(this._games, getCircularReplacer()));
    for (const gameID in gamesSend) {
      const players = gamesSend[gameID].players;
      gamesSend[gameID].players = [];
      for (const playerID in players) {
        const plName = players[playerID].name;
        gamesSend[gameID].players.push(plName);
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
    this._games[id].settings.running = false;
    this.sendToUser(data.id, {mType: 'newLobbyId', data: {id: id}});
    for (let id of Object.keys(this._users)) {
      this.returnAllGames({id: id});
    }
  }

  //returns all games
  returnAllGames(data) {
    const id = data.id;
    const gamesSend = this.prepareGamesForClient();
    this.sendToUser(id, {mType: 'returnAllGames', data: gamesSend});
  }

  //remove all info about user from server
  removeUserFromServer(data) {
    const id = data.id;
    const roomID = data.data.roomID;
    if (roomID) this.leaveGame({id: id, roomID: roomID});
    console.log('this._users[id] ', this._users[id]);
    delete this._users[id];
    idGenerator.removeID(roomID);
  }

  //on user leaves game
  leaveGame(data) {
    const id = data.id;
    const roomID = data.data.roomID;
    if (!this._games.hasOwnProperty(roomID)) {
      console.log('(leaveGame) no such game with id ' + roomID);
      return;
    }
    const players = this._games[roomID].players;
    delete players[id];
    //remove comments on production
    if (Object.keys(this._games[roomID].players).length === 0) {
      delete this._games[roomID];
      idGenerator.removeID(roomID);
    }
    const gamesSend = this.prepareGamesForClient();
    this.sendToAll({mType: 'returnAllGames', data: gamesSend});
    console.log(this._games);
  }

  //broadcast for all people in room
  broadcastInRoom(data) {
    const roomID = data.data.roomID;
    if (!this._games.hasOwnProperty(roomID)) {
      console.log('(broadcast in room) no such game with id ' + roomID);
      return;
    }
    const players = this._games[roomID].players;
    for (let player in players) {
      this.sendToUser(player, {mType: 'broadcastedEvent', data: data});
    }
    
  }

  joinGame(data) {
    const id = data.id;
    const message = data.data;
    this._games[message.id].players[id] = this._users[id];
    const gamesSend = this.prepareGamesForClient();
    this.sendToAll({mType: 'returnAllGames', data: gamesSend});
    const gameData = this._games[message.id];
    for (let player in gameData.players) {
      this.sendToUser(player, {mType: 'newJoin', data: {id: id, name: gameData.players[player].name}});
    }
    this.sendToUser(id, {mType: 'joinGame', data: {id: message.id}});
  }

  //saves bundle to db
  saveBundleToDB(data) {
    const database = new Database(databaseConfig);
    const connection = database.returnConnection();
    connection.connect( async err => {
      if (err) throw err;
      console.log("Connected!");
      console.log('from saveBundle to db' , data.data);
      await database.insertBundle(data.data);
      connection.destroy();
    });
  }

  //on new game master
  newGameMaster(data) {
    this._games[data.data.roomID].settings.master = data.data.newGM;
    const gamesSend = this.prepareGamesForClient();
    this.sendToAll({mType: 'returnAllGames', data: gamesSend});
  }

  //executes on user quitting
  connectionClose(connection) {
    const id = this.getIdByConnection(connection);
    for (let idGame in this._games) {
      const game = this._games[idGame];
      const players = game.players;
      if (players.hasOwnProperty(id)) this.leaveGame({id: id, data: {roomID: idGame}});
    }
    delete this._users[id];
    idGenerator.removeID(id);
    const users = {names: []};
    for (let i in this._users) {
      users.names.push(this._users[i].name);
    }
    this.sendToAll({mType: 'usersOnline', data: users});
  }

  // gets users id by connection
  getIdByConnection(connection) {
    for (let [id, info] of Object.entries(this._users)) {
      if (info.connection === connection) return id;
    }
  }

  //get all bundle names
  getBundleNames(data) {
    const database = new Database(databaseConfig);
    const connection = database.returnConnection();
    connection.on('error', e => console.log("on error: " + e));
    connection.connect( async err => {
      if (err) console.log(err);
      console.log("Connected!");
      let bundleNames = null;
      try {
        bundleNames = await database.getBundleNames();
      } catch (err) {
        console.log(err);
      } 
      this.sendToUser(data.id, {mType: 'bundleNames', data: bundleNames});
      connection.end(err => {
        if(err) console.log("error when connection ends: " + err);
        else console.log("closed");
      });
    });
  }

  //get bundle by name
  getBundleByName(data) {
    const name = data.data.name;
    const database = new Database(databaseConfig);
    const connection = database.returnConnection();
    connection.on('error', e => console.log("on error: " + e));
    connection.connect( async err => {
      if (err) console.log(err);
      console.log("Connected!");
      let bundleRows = null;
      try {
        bundleRows = await database.getBundleByName(name);
      } catch (err) {
        console.log(err);
      }
      this.sendToUser(data.id, {mType: 'bundleRows', data: bundleRows});
      connection.end(err => {
        if (err) console.log("error when connection ends: " + err);
        else console.log("closed");
      });
    });
    
  }
}

module.exports = { Server };
