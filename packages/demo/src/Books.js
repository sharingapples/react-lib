// @flow
import React, { useState, useCallback } from 'react';
import { useSelector, useSelectorMemo, reduxDB } from './store';
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
      <h3>{book.title}<span>{book.id}</span></h3>
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

function populateBooks() {
  reduxDB.books.populate([0, 1, 2, 3].map(() => ({
    id: Math.random(),
    title: `${Math.random()} via Populate`,
  })));
}

function getFilteredBooks(db, allIds, threshold) {
  return allIds.filter(id => db.books.get(id).id > threshold);
}

function getBooks(db, [threshold], filterBooks) {
  const allIds = db.books.allIds();
  return filterBooks(db, allIds, threshold);
}

function FilteredBooks() {
  const [threshold, setThreshold] = useState(0.5);
  const updateThreshold = useCallback((e) => {
    setThreshold(e.target.value);
  }, []);

  const filterBooks = useSelectorMemo(getFilteredBooks);
  const books = useSelector(getBooks, [parseFloat(threshold)], filterBooks);

  return (
    <>
      <input type="text" value={threshold} onChange={updateThreshold} />
      <div>
        <h3>Books with id &gt; {threshold}</h3>
        {books.map(id => <Book key={id} id={id} />)}
      </div>
    </>
  );
}

export default function Books() {
  const books = useSelector(getAllBooks);

  return (
    <div>
      <button type="button" onClick={addBook}>Add</button>
      <button type="button" onClick={replaceBook}>Replace</button>
      <button type="button" onClick={populateBooks}>Populate Books</button>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <Loading visible={!books}>
            <div>
              {books && books.map(id => <Book key={id} id={id} />)}
            </div>
          </Loading>
        </div>
        <div style={{ flex: 1 }}>
          <FilteredBooks />
        </div>
      </div>
    </div>
  );
}
