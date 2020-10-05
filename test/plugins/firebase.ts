import { initializeTestApp, firestore } from '@firebase/rules-unit-testing'
export const firebaseConfig = { projectId: String(new Date().getTime()) }
export const db = initializeTestApp(firebaseConfig).firestore() as firestore.Firestore
