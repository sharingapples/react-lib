export function getAllBooks(db) {
  return db.books.allIds();
}

export function getBook(db, [id]) {
  return db.books.get(id);
}

export function getAllAuthors() {
  //
}
