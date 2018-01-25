import { h, render } from 'preact';


// render((
//     <div id="foo">
//         <span>Hello, world!</span>
//         <button onClick={ e => alert("hi!") }>Click Me</button>
//     </div>
// ), document.body);

function init() {
	const App = require('./app').default;
	render(<App />, document.getElementById('app'));
}

// 删除现有元素！！！
function check(){
	const dom = [...document.querySelectorAll('section.page')]
	dom.map(item => {
		item.remove()
	})
}
// register ServiceWorker via OfflinePlugin, for prod only:
// if (process.env.NODE_ENV==='production') {
// 	require('./pwa');
// }

// in development, set up HMR:
// if (module.hot) {
// 	//require('preact/devtools');   // turn this on if you want to enable React DevTools!
// 	module.hot.accept('./components/app', () => requestAnimationFrame(init) );
// }

check();
init();