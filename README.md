
# Our web-version of SIGame
Our web-version of SIGame

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

## Backend

### Server

### DB
