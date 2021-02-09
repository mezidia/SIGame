import RenderEngine from './engine.js';
import Router from './router.js';
import { changeLanguage } from '../changeLanguage.js';

const router = new Router();
const engine = new RenderEngine();

async function loadMainView() {
  const view = await import('./views/mainPage.js');
  engine.render(view.default);
}

const changeHash = (hash) => () => {
  router.change(hash);
  loadView();
};

const loadView = () => {
  const { viewName } = router.getState();
  engine.loader();
  import(`./views/${viewName}.js`)
    .then((viewModel) => {      
      engine.render(viewModel.default);
    })
    .catch(reason => {
      console.log(reason);
      loadMainView();
    })
    .catch(reason => {
      console.log(reason);
    })
    .finally(changeLanguage());
};

export { loadView, changeHash };
