# redux-db
Redux without boilerplate



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
