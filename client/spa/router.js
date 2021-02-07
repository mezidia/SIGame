export default class Router {

  getHash() {
    return window.location.hash.split('#')[1];
  }

  change(url) {
    globalThis.history.pushState({}, null, `#${url}`);
  }

  replace(hash) {
    globalThis.history.replaceState({}, null, `#${hash}`);
  }
  
  goBack() {
    history.back();
  }

  getView(midURL) {
    return (endURL = '') => ({
      simpleLobby: {viewName: 'simpleLobby'},
      help: {viewName: 'help'},
      createGame: {viewName: 'createGame'},
      chooseMode: {viewName: 'chooseMode'},
      lobbySearch: {viewName: 'lobbySearch'}
    })[midURL] || {viewName: 'mainPage'};
  }

  getState() {
    if (!this.getHash()) return {viewName: 'mainPage'};
    if (this.getHash().includes('/')) {
      const list = this.getHash().split('/');
      return this.getView(list[0])(list[1]);
    }
    return this.getView(this.getHash())();
  }
}
