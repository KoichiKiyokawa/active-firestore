import * as firebase from '@firebase/testing'
import { firestore } from 'firebase'
export const firebaseConfig = { projectId: String(new Date().getTime()) }
export const db = firebase.initializeAdminApp(firebaseConfig).firestore() as firestore.Firestore
