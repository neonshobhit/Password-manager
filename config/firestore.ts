import admin from './firebase';

const db: FirebaseFirestore.Firestore | null = admin.firestore();
db.settings({timestampsInSnapshots: true});

export default db;