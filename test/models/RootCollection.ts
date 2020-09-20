import { Base } from '../../src/index'
import firebase from 'firebase'
import { firebaseConfig } from '../../.env'

firebase.initializeApp(firebaseConfig)
export const _db = firebase.firestore()

export class RootCollection<T extends Record<string, unknown>> extends Base<T> {
  get db(): typeof _db {
    return _db
  }
}
