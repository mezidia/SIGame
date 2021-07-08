
# Our web-version of SIGame
Our web-version of SIGame.
See [there](https://our-si-game.herokuapp.com/#mainPage). 
Won't work if you stop your activity for 55 seconds (because of free hosting).

## Table of Contents

- [Start](#start)
- [Differences from the original](#differences-from-the-original)
- [Frontend](#frontend)
    - [General architecture](#general-architecture)
    - [Controllers and events handling](#controllers-and-events-handling)
    - [Game logic](#game-logic)
- [Backend](#backend)
    - [Server](#server)
    - [DB](#db)

## Start  
To start app go to the main directory and write 
```
node index.js
```
then type
```
http://localhost:5000/#
```
in browser and enjoy=)

## Differences from the original

## Frontend

### General architecture
The entry point is *main.js*, where we create a state object of our program,
hang listeners for different types of events and load the main page.
In general we have a typical SPA app.

File structure:
* In *.\client\gameLogic* - we have all the logic regarding the game.
* In *.\client\spa\views* - we keep page layouts.
* In *.\client\spa\viewsControllers* - we store all the page controllers that are responsible for their logic.
* In *.\client\spa\utils* - we store auxiliary tools.
* In *.\client\spa\engine.js* - we store our render engine.
* In *.\client\spa\router.js* - we store our client router.
* In *.\client\spa\spaControl.js* - we store our site navigation logic.
* In *.\client\spa\uiElements.js* - we store our external ui elements.
* In *.\client\language.js* - we store the logic responsible for site localization.
* In *.\client\utils.js* - we store helpfull functions.
* In *.\client\main.js* - entry point.

Our storage is object with the state of the program, which is imported in the module and changed by reference.

    //main.js
    let storage = {
      socket: null,
      allBundles: null,
      bundlesMeta: [],
      roomId: undefined,
      game: null,
      allGames: null,
      gameInSearchLobby: null,
    };
    
### Controllers and events handling
In *.\client\spa\viewsControllers* folder we keep all the controllers of the corresponding pages.
*spaControl* creates a config of pages and their corresponding controllers based on
*indexControllers.js* in which we import page logic classes.

**example:**

    export { default as CreateGameController } from './createGameController.js';
   
Each controller is solely responsible for the logic of its page. The exception is static interface
elements - they have a separate controller. All universal interface elements such as additional windows
have logic inside their files.

So when we create an event on a certain page, our spaControl gets the name of the current page and
calls the *getHandlers* method in its controller.

Let's analyze a typical page controller class.

**example:**

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
    
*getHandlers* gets the event in arguments, takes its type and adds 'Config'. An event config is an object in which the key is the class or ID of the target, and the value must
be an array of event handler functions. All event handlers are executed asynchronously and sequentially.
In this case, our page should process only 2 buttons, the corresponding handlers are prescribed by class methods. If the controller has handlers - it returns an array of
functions in *main.js* where they are called.

**!Note:** The page controllers can have any inventory configurations, depending on which events they have to process: changeConfig, inputConfig etc.

Function of hanging listeners of events.
    
    //main.js
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

On all necessary types of events we hang an asynchronous lambda that, by means of *getController*, takes the controller of the
current page, and calls *getHandlers* in the necessary controller. Further, if the given controller does not know how to process
event we consider that it is a static element of the interface and we look for handlers in the controller of static elements. If
in any of the cases we get an array of handlers - the functions in it are sequentially called with retransmission to the arguments
of our event.

### Game logic

File structure:
* *.\client\gameLogic\bundle_class.js* - data class.
* *.\client\gameLogic\bundleEditor_class.js* - manages bundles, submiting bundles in bundles editor.
* *.\client\gameLogic\deck_class.js* - data class.
* *.\client\gameLogic\game_class.js* - game logic class, mod: classic.
* *.\client\gameLogic\gameField_class.js* - operating game field DOM.
* *.\client\gameLogic\gameTimer_class.js* - animates visualized game timers.
* *.\client\gameLogic\question_class.js* - data class.
* *.\client\gameLogic\question_reader.js* - shows quenstion text, audio and img.
* *.\client\gameLogic\simpleGame_class.js* - game logic class, mod: simple.
* *.\client\gameLogic\timer_class.js* - timer class.
* *.\client\gameLogic\user_class.js* - singleton user class, stores user data.

The work of auxiliary classes does not have any peculiarities in the implementation, so we will focus only on the class of game logic.

In general, customer interaction and synchronization is based on linking the same events to all customers and their processing. Due to the fact that the server does not know 
about the state of the game, the game is controlled by the game master. That is, most events are generated by the game master and sent to all customers connected to the room.
All events are sent using the *broadcast* function.

      broadcast(...events) {
        for (const event of events) {
          this._socket.send(JSON.stringify({ mType: 'broadcastInRoom', data: {
            event: event,
            roomID: this._id,
          }})); 
        }
      }

The function receives an array of events and sends a message to the server, specifying its own room ID. The server sends this event to all participants in the room.
To avoid re-uploading events, after processing them, or repeatedly sending events, in the main handlers there is a check: whether the client is a master of the game.

**example:**

    const event = {
      eType: 'appeal',
      who: new User().name,
    };
    this.broadcast(event);

**!Note:** 'eType' field is required.

The logic of processing clicks and events is concentrated in the main configs.

      eventsConfig = {
        'leave': this.onLeaveGame,
        'turnOrder': this.onTurnOrder,
        'join': this.onJoinGame,
        'points': this.onPoints,
        ...
      }
      
        clickConfig = {
         'cell': this.onQuestionClick,
         'theme': this.onThemeClick,
         ...
      }

When creating a new copy of the game, we have listeners of events for clicks and server messages. After leaving the game, they are removed. The clicker handler looks for a
handler in the configuration by the ID of the clicked target.

      _setListeners() {
        document.addEventListener('click', this.clickHandler);
        this._socket.addEventListener('message', this.socketHandler);
      }

      _removeListeners() {
        document.removeEventListener('click', this.clickHandler);
        this._socket.removeEventListener('message', this.socketHandler);
      }
At the beginning of the file we have several constants that control the minimum number of players, turn time, appeal time and game time. 

    //game_class.js
    const ANSWERTIME = 10; //sec
    const GAMETIME = 500; //sec
    const APPEALTIME = 5; //sec
    const MIN_PLAYERS = 3; // minimum amount of players 

The simple game class follows the classic game class, but changes some of its methods to change the course of the game.

### Localization  
To translate text in html we use *data-localize* tag. It is used like id:
```
data-localize="translateme"
```
We store translation for each text in [*localization* directory](./localization). In each file we store data-localize ids and translations.  
```
de.js  

..."translateme": "Translate me!",...
```
```
ua.js  
  
..."translateme": "Переклади мене!",...  
```
To translate website we use [Language class](./client/changeLanguage.js). There we import localization files and save them in the *_languages* field. Active language you can get by using *getLanguage* or *getLangcode* functions. *getTranslatedText* can be used in popups, text in their html should be styled like this:  
```
<p data-localize="translateme">Language.getTranslatedText('translateme')</p>
```
When langcode button is being clicked on the page, *changeLanguage* is executed.  
  
### Local Storage  
To save name and preferable language we use local storage.


## Backend

### Server
This server is written without any frameworks, using only vanilla js (node js).  
To start the server create a new instance of [class Server](./server/server.js) and pass there a port ([example](index.js)). Class Server is singleton.  
Connection between backend and frontend happens with the help of websockets and [ws framework](https://github.com/websockets/ws).  
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
To connect to db from server we use [database class](./database/database.js) and pass there parameters:  
```
const database = new Database(databaseConfig);
```  
See example of *databaseConfig* [there](./database/database.config.json).  
We use [mysql framework](https://github.com/mysqljs/mysql) for connecting with db, so we need only connection, which we can get by using  
```
const connection = database.returnConnection();
```
and then using mysql framework and Database class functions.
### DB  
All database functions are stored in the Database class. We use mysql database for this project. Class diagram of it can be found in [there](ClassDiagram.png). Before inserting or selecting something from db use *checkExistance* function to be sure that tables exist (this function creates them even if they don't). To store audio and images we use file server, which is positioned in the [*fileServer*](./fileServer), than it is split by year and month directories. We use date and question_id to get audio and images.
