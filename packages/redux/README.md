# redux-db
Redux without boilerplate

## Using hydration
```javascript
import { createHydrator, schema, record } from '@sharingapples/redux';
const books = schema('books', 1);
const user = record('user');

const structure = { user, books };
const hydrator = createHydrator(structure, (state) => {
  localStorage.setItem('skey', JSON.stringify(state));
});

const reducer = hydrator.enhanceReducer(structureReducer);
const store = createStore(reducer);

const data = localStorage.getItem('skey');
if (data) {
  hydrator.hydrate(store, JSON.parse(data));
}
```

## Using memoization with selectors
```javascript
import React, { useState } from 'react';
import { useSelector } from '../store';

function getTodos(selector, [completed]) {
  const allIds = selector.todos.allIds();
  return completed === null || allIds === null ? allIds : selector.memoize(() => {
    return allids.filter(selector => selector.todos.get(id).completed === completed);
  });
}

function Todo({ id }) {
  const todo = useSelector(db => db.todos.get(id), [id]);
  return todo.title;
}

export default function Todos() {
  const [completed, setCompleted] = useState(null);
  const todos = useSelector(getTodos, [completed]);

  return (
    <div>
      {todos.map(id => <Todo key={id} id={id} />)}
      <input type="checkbox" checked={completed} onClick={(e) => setCompleted(e.target.value)} />
    </div>
  );
}

```

```javascript
import { schema, record } from '@sharingapples/redux';

const totalPrice = book => aggr.sum(book.price);
const totalAmount = copoun => aggr.sum(coupon.amount);

const bookings = schema('books', 1, {
  byAuthor: {
    version: 1,
    index: 'author',
    aggr: { totalPrice }
  },
  byDate: {
    version: 1,
    index: book => book.date.toDateString(),
    aggr: { totalPrice },
  }
});

const coupons = schema(1, {
  daily: {
    version: 1,
    index: coupon => Math.floor(coupon.created / 1000),
    order: 'DESC',
    aggr: { totalAmount: coupon => aggr.sum(coupon.amount) },
  },
  monthly: {
    version: 1,
    index: coupon => {
      const dt = new Date(coupon.created);
      return `${dt.getYear()}-${dt.getMonth()}`
    },
    aggr: { totalAmount: coupon => aggr.sum(coupon.amount) },
  },
});

const struture = {
  user: record(),
  bookings,
  coupons,
};

const store = createStore(combineReducers(createReducer(structure)));
const reduxDB = createActor(structure, store.dispatch);
const useSelector = createSelector(structure, store);

// Use the actor
reduxDB.books.insert({ id: 1, title: 'Dr. Frankestein' });

// Actions available with `record`
// reduxDB.user.update({});
// reduxDB.user.replace({});
// reduxDB.user.clear();

// Use the selector
function AwesomeComponent() {
  const books = useSelector(db => db.books.allIds());

  return (
    <div>
      {books.map(id => <Book key={id} id={id} />)}
    </div>
  );
}
```
