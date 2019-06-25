/* global document */
import React from 'react';
import { render } from 'react-dom';

import Books from './Books';

function App() {
  return (
    <div>
      <div>Hello World</div>
      <Books />
    </div>
  );
}

render(<App />, document.getElementById('root'));
