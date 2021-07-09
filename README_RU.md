# Наша веб-версия «Своей Игры»
Наша веб-версия «Своей Игры».
Можете опробовать [тут](https://our-si-game.herokuapp.com/#mainPage). 
Перестаёт работать после 55 секунд неактивности (из-за бесплатного хостинга).

## Содержание

- [Our web-version of SIGame](#our-web-version-of-sigame)
  - [Table of Contents](#table-of-contents)
  - [Technology stack](#technology-stack)
  - [Start](#start)
    - [Preparation](#preparation)
    - [To start app on your local machine](#to-start-app-on-your-local-machine)
    - [To start it on server](#to-start-it-on-server)
  - [Differences from the original](#differences-from-the-original)
  - [Rules](#rules)
  - [Frontend](#frontend)
    - [General architecture](#general-architecture)
    - [Routing](#routing)
    - [Controllers and events handling](#controllers-and-events-handling)
    - [Game logic](#game-logic)
    - [Timers and In-Game UI](#timers-and-in-game-ui)
    - [Localization](#localization)
    - [Local Storage](#local-storage)
  - [Backend](#backend)
    - [Server](#server)
      - [Messages to server](#messages-to-server)
      - [Clients online](#clients-online)
      - [Available games](#available-games)
      - [Connection with database](#connection-with-database)
    - [DB](#db)

## Технологический стек
- JavaScript
- Node.js
- WebSocket
- MySQL
- Bootstrap

## Старт
### Подготовка
- Установите `node.js` и `npm`
- Установите `MySQL`
- Запустите `npm i` в консоли, чтобы установить все библиотеки
### Чтобы запустить на локальной машине
- Перейдите в корневую папку и напишите в консоли
```
node index.js
```
или
```
npm run
```
- введите в браузере
```
http://localhost:5000/#
```
- наслаждайтесь=)

### Чтобы запустить на сервере
- Поменяйте адрес вебсокетов в `mainPageController.js` на ваше доменное имя;
``` js
// mainPageController.js

const wsAdress = `ws://mywebsite.com`;
``` 
- введите в корневой папке в консоли
```
node index.js
```
или
```
npm run
```
- введите ваше доменное имя в строку браузера
```
http://mywebsite.com
```

## Отличия от оригинала
- Редактор вопросов и игра в одном месте
- Простой JS вместо of React.js и TypeScript
- Поддержка украинского и немецкого
- Переработаный интерфейс для DJU
- Наборы вопросов сохраняются в `.json` формате вместо `.siq`
- Другая структура проекта
- Упрощены некоторые аспекты игры: пользователи онлайн, система жалоб, пауза, игровая логика

## Правила
Примерно такие же, как и в оригинале.
## Frontend

### Общая архитектура
Входная точка — `main.js`, где мы создаём объект состояния(state object) нашей программы,
навешиваем listeners для разных видов событий и загружаем главную страничку.
В общем у нас обычное SPA(single page application) с маршрутизацией(routing) на стороне клиента.

Файловая структура:
* `./client/gameLogic/` - вся игровая логика.
* `./client/spa/views/` - макеты страниц.
* `./client/spa/viewsControllers` - контроллеры страниц, которые отвечают за их логику.
* `./client/spa/utils/ - вспомогательные инструменты.
* `./client/spa/engine.js` - движок для отрисовки.
* `./client/spa/router.js` - маршрутизатор.
* `./client/spa/spaCortrol.js` - навигационная и отрисовочная логика.
* `./client/spa/uiElements.js` - внешние элементы интерфейса.
* `./client/language.js` - логика перевода.
* `./client/utils.js` - вспомогательные функции.
* `./client/main.js` - входная точка.

Наше хранилище это объект с состоянием программы, который мы импортируем в каждый модуль и меняем по ссылке(изменения применяются везде).

``` js
// main.js

let storage = {
  socket: null,
  allBundles: null,
  bundlesMeta: [],
  roomId: undefined,
  game: null,
  allGames: null,
  gameInSearchLobby: null,
};
```
### Маршрутизация
У нас маршрутизация на стороне клиента, которую контролирует `./client/spa/router.js` и `./client/spa/spaControl.js`.

`router.js` ответственный за загрузку правильной странички в зависимости от хеша странички и манипуляцию адресом страницы. `spaControl.js` ответственен за обработку этой информации и отрисовку страничек при помощи `RenderEngine` из `engine.js`.

### Контроллеры и обработка событий
В папке `./client/spa/viewsControllers` мы храним все контроллеры к соответствующим страничкам.
`spaControl` создаёт конфигурацию страничек и соответствующих им контроллеров на основе
`indexControllers.js` в который мы импортируем логику классов страниц.

**Пример:**
``` js
export { default as CreateGameController } from './createGameController.js';
```
Каждый контроллер ответственный только за свою страничку. Единственное исключение — статические элементы сайта - у них отдельный контроллер. У всех дополнительных элементов интерфейса, таких как всплывающие окна, вся логика внутри их файлов.

Когда мы создаём событие на какой-то страничке, наш `spaControl` получает имя странички и
вызывает метод `getHandlers` в её контроллере.

Проанализируем типичный класс контроллера.

**Пример:**

``` js
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

  // join-btn click handle
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
```    
`getHandlers` принимает событие аргументом, берёт его тип и добавляет слово 'Config'. Конфиг событий это объект, в котором ключ это класс или ID элемента, а значение —
массив функций-обработчиков этого события. Все обработчики событий выполняются асинхронно и последовательно.
В данном случае, наша страничка обрабатывает всего две кнопки, соответствующие обработчики объявлены как методы класса. Если у контроллера есть обработчики — он возвращает массив функций в `main.js` где они вызываются.

**!Примечание:** В контроллерах может быть любой тип конфигурации, в зависимости от обрабатываемых событий: `changeConfig`, `inputConfig`, `clickConfig` и др.

Функция навешивания обработчиков событий.
``` js
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
```
На все нужные типы событий мы навешиваем асинхронную функцию что, посредством `getController`, берёт контроллер текущей странички, и вызывает `getHandlers` у нужного контроллера. Дальше, если контроллер не знает как обработать событие, мы считаем, что это статический элемент интерфейса и ищем обработчики в контроллере статических элементов. Если в любом из этих случаев мы находим обработчики, функции последовательно вызовутся с событием в роли аргумента.

### Игровая логика

Файловая структура:
* `./client/gameLogic/bundle_class.js` - класс набора вопросов, состоит из колод.
* `./client/gameLogic/bundleEditor_class.js` - работает с наборами, сохранение наборов в редакторе.
* `./client/gameLogic/deck_class.js` - колода вопросов.
* `./client/gameLogic/game_class.js` - игровая логика классического режима.
* `./client/gameLogic/gameField_class.js` - визуальная часть игры.
* `./client/gameLogic/gameTimer_class.js` - таймер для визуализации.
* `./client/gameLogic/question_class.js` - класс вопроса.
* `./client/gameLogic/question_reader.js` - читает текстовый, аудио и вопрос с картинкой.
* `./client/gameLogic/simpleGame_class.js` - игровая логика упрощённого режима.
* `./client/gameLogic/timer_class.js` - класс таймера.
* `./client/gameLogic/user_class.js` - singleton класс пользователя, хранит его данные.

У работы вспомогательных классов нет никаких особенностей в реадизации, так что сосредоточимся на классе с игровой логикой.

В общем, взаимодействие и синхронизация пользователей основаны на рассылке событий всем пользователям. Сервер ничего не знает о состоянии игры, поэтому игру контролирует ведущий. Большинство событий генерирует ведущий и отправляет всем игрокам в комнате.
Все события посылаются функцией `broadcast`.
``` js
broadcast(...events) {
  for (const event of events) {
    this._socket.send(JSON.stringify({ mType: 'broadcastInRoom', data: {
      event: event,
      roomID: this._id,
    }})); 
  }
}
```
Функция получает массив событий и отправляет сообщение на сервер, обозначая ID своей комнаты. Сервер отправляет это событие всем игрокам в комнате.
Чтобы избежать повторяющихся событий в обработчиках есть проверка: это ведущий или простой игрок.

**Пример:**
``` js
const event = {
  eType: 'appeal',
  who: new User().name,
};
this.broadcast(event);
```
**!Примечание:** поле 'eType' обязательное.

Логика обработки нажатий и событий сосредоточена в главных конфигах.
``` js
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
```
При создании новой игры, мы создаём обработчики событий на действия пользователя и сообщения с сервера. После ухода из игры, они удаляются. Обработчик действий пользователя смотрит на ID и класс элемента, с которым взаимодействует пользователь.

``` js
_setListeners() {
  document.addEventListener('click', this.clickHandler);
  this._socket.addEventListener('message', this.socketHandler);
}

_removeListeners() {
  document.removeEventListener('click', this.clickHandler);
  this._socket.removeEventListener('message', this.socketHandler);
}
```
В начале файла стоят константы, что контролируют минимальное количество игроков, время на ход, время на аппеляцию и время на игру. 
``` js
// game_class.js

const ANSWERTIME = 10; // sec
const GAMETIME = 500; // sec
const APPEALTIME = 5; // sec
const MIN_PLAYERS = 3; // minimum amount of players 
```

Класс упрощённой игры наследует класс обычной игры, но переопределяет некоторые методы чтобы поменять ход игры.

### Таймеры и внутриигровой интерфейс
Есть два типа таймеров: `Timer` и `GameTimer`.
- `Timer` вызывает колбек когда заканчивается, чаще всего какая-то игровая логика
- `GameTimer` вызывает колбек при каждом тике(по умолчанию 1 секунда). Используется, чтобы показать сколько осталось времени.

Каждое другое действие над игровым интерфейсом контролирует `gameField.js`:
- изменение разметки
- отрисовка всплывающих окон
- зачитка вопросов при помощи класса `QReader` из `question_reader.js`.
  
`question_reader.js` отвечает за работу с вопросами:
- отображение текста
- зачитка текста
- отправка события о конце зачитки
- отображение вопроса с картинкой
- воспроизведение аудио-вопросов

### Перевод
Для перевода в html мы используем атрибут `data-localize`, который используется как id:
```
data-localize="translateme"
```
Мы храним весь перевод в [папке *localization*](./localization). В каждом файле мы храним id от data-localize и перевод.

``` js
// de.js  

..."translateme": "Translate me!",...
```
``` js
// ua.js  
  
..."translateme": "Переклади мене!",...  
```
Для перевода веб-сайта мы используем класс [Language](./client/changeLanguage.js). Туда мы импортируем файлы локализации и храним их в поле `_languages`. Узнать текущий язык можно при помощи функций `getLanguage` и `getLangcode`. `getTranslatedText` можно использовать во всплывающих окнах, их шаблонный html должен выглядеть так:  
``` html
<p data-localize="translateme">Language.getTranslatedText('translateme')</p>
```
Когда нажимают кнопку смены языка на странице, вызывается `changeLanguage`.  
  
### Local Storage  
Чтобы сохранить имя и предпочитаемый язык мы используем local storage.


## Backend

### Сервер
Сервер написан на простом js, без использования фреймворков(не считая node js).  
Чтобы запусить сервер создайте объект класса [Server](./server/server.js) и передайте номер нужного вам порта ([пример](index.js)). Класс Server — синглтон.  
Соединение между backend и frontend осуществляется при помощи websocket и [библиотеки ws](https://github.com/websockets/ws).  
#### Сообщения серверу
Сообщение, что проходит на сервер должно иметь такую структуру:  
``` js
{mType: "sometype", data: {somedata}}
```  
При помощи поля `_messageConfig` можно отследить какие функции обрабатывают запросы. Чтобы добавить новый вид сообщения добавьте туда строчку:  
``` js
... 'newmType': data => functionToHandleNewmType(data) ...,  
```
потом добавьте новую функцию, что будет это обрабатывать.

**!Примечание:** данные должны быть такого формата:  
``` js
{id: usersId, data: dataFromMessage}  
```
Сообщение клиенту должно иметь такую же структуру, как и сообщение серверу.  
Чтобы передать сообщение всем пользователям используйте функцию `sendToAll` и передайте туда сообщение. Чтобы передать определённому пользователю используйте `sendToUser`, передайте туда id пользователя, которому хотите отправить сообщение.  
#### Пользователи онлайн
Когда пользователь подключается к веб-сайту, вызывается функция `connectionOpen`, которая сохраняет его подключение. Когда клиент отправляет сообщение на сервер, `connectionMessage` обрабатывает его (см. прошлый раздел). Когда пользователь уходит, `connectionClose` удаляет его данные.  
Пользователи онлайн хранятся в поле `_users` класса `Server`. Для каждого пользователя мы генерируем уникальный id, и все сохраняются в объекте с такой структурой:  
``` js
... uniqueUserId: {connection: usersWebSocketConnection, name: usersName} ...  
```
Чтобы получить id из соединения можно использовать функцию `getIdByConnection`.
#### Доступные игры
Все игры хранятся в поле `_games` с такой структурой:  
``` js
... uniqueIdForTheGame: {players: { uniqueUserId: {userInfoLikeInUsersField}, }, bundle: bundleForThisGame, settings: settingsForThisGame} ...  
```    
#### Соединение с БД  
Чтобы подключиться к БД мы используем класс [Database](./database/database.js) и передаём туда параметры:  
``` js
const database = new Database(databaseConfig);
```  
Пример `databaseConfig` можно увидеть [тут](./database/database.config.json).  
Мы используем [mysql framework](https://github.com/mysqljs/mysql) для подключения к БД, так что нам нужно единственное подключение, которое можно получить так:  
``` js
const connection = database.returnConnection();
```
и дальше обрабатывать фреймворком mysql и методами класса Database.
### База данных
Все функции базы данных хранятся в классе `Database`. Мы используем базу данных **MySQL**. Диаграмму сущностей можно найти [тут](ClassDiagram.png). Перед вставкой или селектом чего-либо из базы данных используйте функцию `checkExistance`, чтоб убедиться что таблица существует (эта функция создаёт их если их нет). Чтобы хранить аудио и картинки мы используем файловую систему, папку `./fileServer`, потом делим папки по месяцу и году. Мы используем `question_id` из базы данных чтобы найти аудио и картинки.
