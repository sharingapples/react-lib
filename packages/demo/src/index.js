/* global document */
import React from 'react';
import { render } from 'react-dom';

import { useSelector, reduxDB } from './store';

import Books from './Books';

function changeUser() {
  reduxDB.user.update({
    name: `User-${Math.random()}`,
  });
}

function User() {
  const user = useSelector(db => db.user.get());

  return (<div>Hello {user && user.name}</div>);
}

function App() {
  return (
    <div>
      <User />
      <button type="button" onClick={changeUser}>Change User</button>
      <Books />
    </div>
  );
}

render(<App />, document.getElementById('root'));
