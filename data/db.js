import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

// Provide the adapter with the path to where we
// want to store our data
const adapter = new FileSync('db.json');
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({
  reports: [
    {
      id: 0,
      note: 'lorem ipsum dolor sit amet',
      type: 'Feeding',
    },
  ],
}).write();

export default db;
