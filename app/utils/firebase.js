import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA8yxmpkgivvC5RzVxKuhAr3dpihf3nlQQ",
  databaseURL: "https://water-level-project-c8fab-default-rtdb.firebaseio.com",
  projectId: "water-level-project-c8fab",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
