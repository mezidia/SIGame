
# Our web-version of SIGame
Our web-version of SIGame

## Table of Contents

- [Start](#start)
- [Differences from the original](#differences-from-the-original)
- [Frontend](#frontend)
    - [General architecture](#general-architecture)
    - [Game logic](#game-logic)
- [Backend](#backend)
    - [Server](#server)
    - [DB](#db)

## Start

## Differences from the original

## Frontend

### General architecture
The entry point is main.js, where we create a state object of our program,
hang listeners for different types of events and load the main page.

Our storage is object with the state of the program, which is imported in the module and changed by reference.

    let storage = {
      socket: null,
      allBundles: null,
      bundlesMeta: [],
      roomId: undefined,
      game: null,
      allGames: null,
      gameInSearchLobby: null,
    };

In .\client\spa\viewsControllers folder we keep all the controllers of the corresponding pages.
spaControl creates a config of pages and their corresponding controllers based on indexControllers.js
in which we import page logic classes.

*example:*

    export { default as CreateGameController } from './createGameController.js';
   
Each controller is solely responsible for the logic of its page. The exception is static interface
elements - they have a separate controller. All universal interface elements such as additional windows
have logic inside their files.

So when we create an event on a certain page, our spaControl gets the name of the current page and
calls the getHandlers function in its controller.

Let's analyze a typical page controller class.

*example:*

    export default class ChooseModeController {

      clickConfig = {
        'create-game-btn': [this.createGameLobby],
        'join-btn': [this.joinLobby],

      }

      getHandlers(evt) {
        const configString = evt.type + 'Config';
        if (!this[configString]) return false;
        if (!this[configString][evt.target.id]) return false;
        return this[configString][evt.target.id];
      }

      //join-btn click handle
      async joinLobby() {
        await changeHash('lobbySearch')();
        updateGames(storage.allGames);
      }

      createGameLobby() {
        loader();
        const msg = {
          'mType': 'getBundleNames',
        };
        promisifySocketMSG(msg, 'bundleNames', storage.socket).then(msg => {
          for (const i in msg.data) {
            storage.bundlesMeta[i] = msg.data[i];
          }
          changeHash('createGame')();
        });
      }

    }

    function setupListeners() {
      const events = ['click', 'keydown', 'input', 'change'];
      for (const event of events) {
        document.addEventListener(event, async evt => {
          let controller = getController();
          let handlersArr = controller.getHandlers(evt);
          if (!handlersArr) {
            controller = getController('StaticElementsController');
            handlersArr = controller.getHandlers(evt);
          }
          if (!handlersArr) return;
          for await(const handler of handlersArr) {
            handler(evt);
          }
        });
      }
    }

### Game logic

## Backend

### Server
This server is written without any frameworks, using only vanilla js (node js).  
To start the server create a new instance of class Server and pass there a port (example in file index.js). Class Server is singleton.  
Connection between backend and frontend happens with the help of websockets and ws framework.  
#### Messages to server
Message, that comes to server should have the following structure:  
```
{mType: "sometype", data: {somedata}}
```  
With the help of *_messageConfig* field you can track what functions handle different types of messages. To add a new type of message add there a new line:  
```
... 'newmType': data => functionToHandleNewmType(data) ...,  
```
than add new function, be aware that data passed to it will have the following structure:  
```
{id: usersId, data: dataFromMessage}  
```
Message to the client should have the same structure as messages to the server.  
To pass your message to all the clients use *sendToAll* function and pass there message. To pass it to the specific client use *sendToUser* function, pass there id of the client, you want to send your message to.  
#### Clients online  
When user connects to the website, function *connectionOpen* is being executed. It stores his connection. When client sends some messages to the server, *connectionMessage* handles it (we discussed it in details in previous section). When user leaves, *connectionClose* deletes his info.  
Clients online are stored in Server class field called *_users*. For every user we generate his own unique id, so everybody is being saved in the object using the following structure:  
```
... uniqueUserId: {connection: usersWebSocketConnection, name: usersName} ...  
```
To get id from connection you can use *getIdByConnection* function.
#### Available games
All games are being stored in *_games* field with the following structure:  
```
... uniqueIdForTheGame: {players: { uniqueUserId: {userInfoLikeInUsersField}, }, bundle: bundleForThisGame, settings: settingsForThisGame} ...  
```    
#### Connection with database  
To connect to db from server we use database class and pass there parameters:  
```
const database = new Database(databaseConfig);
```  
See example of *databaseConfig* in database.config.json.  
We use mysql framework for connecting with db, so we need only connection, which we can get by using  
```
const connection = database.returnConnection();
```
and then using mysql framework and Database class functions.

### DB
