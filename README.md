
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

### DB
