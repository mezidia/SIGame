export default class Router {

  getHash() {
    return window.location.hash.split('#')[1];
  }

  changeURL(url) {
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
