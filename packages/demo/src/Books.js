// @flow
import React from 'react';
import { useSelector, reduxDB } from './store';
import { getAllBooks, getBook } from './store/selectors';

import Loading from './Loading';

function Book({ id }: { id: string }) {
  const book = useSelector(getBook, [id]);

  function editTitle() {
    reduxDB.books.update({ id, title: 'Changed Title' });
  }

  function replace() {
    reduxDB.books.replace({ id, title: 'Replaced record' });
  }

  function remove() {
    reduxDB.books.delete(id);
  }

  return (
    <div>
      <h3>{book.title}</h3>
      <div>
        <button type="button" onClick={editTitle}>Edit</button>
        <button type="button" onClick={replace}>Replace</button>
        <button type="button" onClick={remove}>Delete</button>
      </div>
    </div>
  );
}

function addBook() {
  reduxDB.books.insert({
    id: Math.random(),
    title: Math.random(),
  });
}

function replaceBook() {
  reduxDB.books.replace({
    id: Math.random(),
    title: `${Math.random()} via Replace`,
  });
}

export default function Books() {
  const books = useSelector(getAllBooks);

  return (
    <div>
      <button type="button" onClick={addBook}>Add</button>
      <button type="button" onClick={replaceBook}>Replace</button>
      <Loading visible={!books}>
        <div>
          {books && books.map(id => <Book key={id} id={id} />)}
        </div>
      </Loading>
    </div>
  );
}
