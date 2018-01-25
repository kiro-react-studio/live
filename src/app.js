import { h, Component } from 'preact';
import { Router } from 'preact-router';

import createHashHistory from 'history/createHashHistory';
import { Home, Video, Option , Room, RoomList, Join} from './module';

// import { Logger } from 'util';

// import Header from './header';
// import Home from './home';
// import Profile from './profile';

export default class App extends Component {
  /** Gets fired when the route changes.
   *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
   *	@param {string} event.url	The newly routed URL
   */
  handleRoute = e => {
    this.currentUrl = e.url;
  };

  render() {
    return (
      <Router onChange={this.handleRoute} history={createHashHistory()}>
        <Home path="/" />
        <Video path="/video/" />
        <Option path="/setting/" />
        <RoomList path="/roomlist/" />
        <Room path="/room/" />
        <Join path='/join' />
      </Router>
    );
  }
}
