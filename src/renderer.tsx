import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { hot } from 'react-hot-loader';

import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

export default hot(module)(App)
