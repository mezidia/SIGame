'use strict';

const view = () => {
  return `<div class="container" style="margin-top: 20px;">
    <h1 data-localize="help-page">Help page</h1>
    <div class="go-up-btn" id="go-up-btn"><svg width="24" height="24" class="go-up-btn" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M23.245 20l-11.245-14.374-11.219 14.374-.781-.619 12-15.381 12 15.391-.755.609z"/></svg></div>
    <ul>
      <li><a class="scrollTo" id="ref_help-rules" data-localize="rules">Rules</a></li>
      <li><a class="scrollTo" id="ref_help-questions" data-localize="questions">Questions</a></li>
      <li><a class="scrollTo" id="ref_help-bug" data-localize="bugs">Bugs</a></li>
    </ul>
    <h2 class="highlighted-header" id="help-rules" data-localize="rules-of-the-game">Rules of the game</h2>
    <p data-localize="rules-text">

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis purus purus. Vestibulum sit amet tempus velit, a porttitor sapien. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aliquam dictum augue elit, a semper nibh fermentum et. Curabitur feugiat ligula nec turpis lobortis, vel ultricies eros laoreet. Phasellus enim nulla, rutrum eget vestibulum a, maximus faucibus est. Nam ultrices lobortis tincidunt. Duis eget convallis libero. Suspendisse id elit sem.

Phasellus hendrerit congue odio, a faucibus nibh porta auctor. Fusce fermentum, enim vitae malesuada consequat, ligula est convallis elit, eu tempor magna nunc nec nibh. Aliquam porta leo ac enim venenatis, vitae dapibus est pretium. Donec facilisis arcu arcu, in sodales ipsum euismod vitae. Aliquam justo dolor, semper sit amet erat gravida, imperdiet auctor felis. Maecenas volutpat risus metus, sit amet dapibus sem molestie nec. Vivamus at erat ultricies, mollis odio et, imperdiet sem. Proin et mauris maximus, molestie orci eget, vulputate leo. Proin porttitor eros nisi, nec ullamcorper diam dictum sed. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent tincidunt efficitur porta. Nunc vitae consequat orci, non ultricies lorem. Nam lobortis efficitur turpis, in placerat nisi facilisis ac. Suspendisse nec lectus ut nisi maximus sagittis et sed sapien. Morbi eu maximus leo.

Mauris ut dui vel metus vestibulum tristique. Suspendisse dictum feugiat rhoncus. Etiam sit amet dui eu ex lacinia maximus volutpat eu arcu. Nulla massa lectus, rutrum nec odio eu, efficitur consectetur justo. Nunc eu commodo urna. Nam lorem dui, blandit eget posuere et, pellentesque a risus. Donec pharetra pulvinar eros et dictum. Praesent bibendum arcu vitae nulla ultricies eleifend.

Curabitur vestibulum accumsan facilisis. Morbi laoreet efficitur tempus. Proin suscipit quam a eros malesuada, vel viverra nisi vehicula. Donec venenatis sapien ut quam convallis, elementum fermentum nunc tempor. Vivamus bibendum, sem vitae lobortis placerat, nunc elit egestas dolor, eget viverra velit arcu in erat. Duis non est ante. Nulla nisi eros, viverra vitae ultricies at, tempor vitae nibh. Donec ut lectus at ligula ultricies molestie. Cras pretium ullamcorper lacus ut cursus. Nullam semper vel magna vel imperdiet. Pellentesque ex enim, malesuada ac placerat sed, consectetur vel dui. Duis vitae pellentesque felis, porttitor vestibulum felis. Ut aliquet, nunc et efficitur maximus, lacus purus euismod dui, sit amet malesuada massa felis non massa. Nulla imperdiet velit ac risus mattis laoreet. Mauris euismod ligula ipsum, ac accumsan nibh varius sit amet. Sed placerat ligula sed sodales auctor.

Quisque porttitor tellus quis arcu sollicitudin rhoncus. Curabitur elit ligula, lacinia sed risus et, euismod varius erat. Sed dui purus, porta egestas accumsan vel, tincidunt nec ipsum. Vivamus augue ante, hendrerit id dolor nec, finibus imperdiet eros. Quisque ut justo erat. Morbi semper, metus eu fringilla sodales, orci massa tincidunt urna, id varius arcu erat feugiat nisi. In vel aliquet ipsum. Sed nisl nisi, euismod nec luctus sit amet, lobortis vitae orci. Nullam sed vehicula eros, tincidunt rhoncus ante. Integer non volutpat libero. Aliquam vitae tincidunt justo. Integer eget erat semper, congue turpis faucibus, accumsan massa. Morbi vestibulum viverra risus facilisis dignissim. Integer quis euismod orci, vel aliquet dui. Aenean sodales ut neque a varius.</p>
    <h2 class="highlighted-header" id="help-questions" data-localize="how-to-bundle">How to make your own questions</h2>
    <p>
      <ol>
        <li data-localize="how-to-bundle-1">Go to the tab 'Create Bundle' on the main page</li>
        <li data-localize="how-to-bundle-2">Fill all blank spaces in the form and submit it</li>
        <li data-localize="how-to-bundle-3">Download your bundle in JSON format, and if you want it to be in our database click the checkbox</li>
      </ol>
    </p>
    <h2 class="highlighted-header" id="help-bug" data-localize="found-bug">Found a bug?</h2>
    <p data-localize="bug-handling-text">

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis purus purus. Vestibulum sit amet tempus velit, a porttitor sapien. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aliquam dictum augue elit, a semper nibh fermentum et. Curabitur feugiat ligula nec turpis lobortis, vel ultricies eros laoreet. Phasellus enim nulla, rutrum eget vestibulum a, maximus faucibus est. Nam ultrices lobortis tincidunt. Duis eget convallis libero. Suspendisse id elit sem.

Phasellus hendrerit congue odio, a faucibus nibh porta auctor. Fusce fermentum, enim vitae malesuada consequat, ligula est convallis elit, eu tempor magna nunc nec nibh. Aliquam porta leo ac enim venenatis, vitae dapibus est pretium. Donec facilisis arcu arcu, in sodales ipsum euismod vitae. Aliquam justo dolor, semper sit amet erat gravida, imperdiet auctor felis. Maecenas volutpat risus metus, sit amet dapibus sem molestie nec. Vivamus at erat ultricies, mollis odio et, imperdiet sem. Proin et mauris maximus, molestie orci eget, vulputate leo. Proin porttitor eros nisi, nec ullamcorper diam dictum sed. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent tincidunt efficitur porta. Nunc vitae consequat orci, non ultricies lorem. Nam lobortis efficitur turpis, in placerat nisi facilisis ac. Suspendisse nec lectus ut nisi maximus sagittis et sed sapien. Morbi eu maximus leo.

Mauris ut dui vel metus vestibulum tristique. Suspendisse dictum feugiat rhoncus. Etiam sit amet dui eu ex lacinia maximus volutpat eu arcu. Nulla massa lectus, rutrum nec odio eu, efficitur consectetur justo. Nunc eu commodo urna. Nam lorem dui, blandit eget posuere et, pellentesque a risus. Donec pharetra pulvinar eros et dictum. Praesent bibendum arcu vitae nulla ultricies eleifend.

Curabitur vestibulum accumsan facilisis. Morbi laoreet efficitur tempus. Proin suscipit quam a eros malesuada, vel viverra nisi vehicula. Donec venenatis sapien ut quam convallis, elementum fermentum nunc tempor. Vivamus bibendum, sem vitae lobortis placerat, nunc elit egestas dolor, eget viverra velit arcu in erat. Duis non est ante. Nulla nisi eros, viverra vitae ultricies at, tempor vitae nibh. Donec ut lectus at ligula ultricies molestie. Cras pretium ullamcorper lacus ut cursus. Nullam semper vel magna vel imperdiet. Pellentesque ex enim, malesuada ac placerat sed, consectetur vel dui. Duis vitae pellentesque felis, porttitor vestibulum felis. Ut aliquet, nunc et efficitur maximus, lacus purus euismod dui, sit amet malesuada massa felis non massa. Nulla imperdiet velit ac risus mattis laoreet. Mauris euismod ligula ipsum, ac accumsan nibh varius sit amet. Sed placerat ligula sed sodales auctor.

Quisque porttitor tellus quis arcu sollicitudin rhoncus. Curabitur elit ligula, lacinia sed risus et, euismod varius erat. Sed dui purus, porta egestas accumsan vel, tincidunt nec ipsum. Vivamus augue ante, hendrerit id dolor nec, finibus imperdiet eros. Quisque ut justo erat. Morbi semper, metus eu fringilla sodales, orci massa tincidunt urna, id varius arcu erat feugiat nisi. In vel aliquet ipsum. Sed nisl nisi, euismod nec luctus sit amet, lobortis vitae orci. Nullam sed vehicula eros, tincidunt rhoncus ante. Integer non volutpat libero. Aliquam vitae tincidunt justo. Integer eget erat semper, congue turpis faucibus, accumsan massa. Morbi vestibulum viverra risus facilisis dignissim. Integer quis euismod orci, vel aliquet dui. Aenean sodales ut neque a varius. </p>
  </div>
  <div style="height: 75px; background-color: #2f6473"></div>
  `
};

export default view;
