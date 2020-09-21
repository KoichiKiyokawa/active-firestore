import { Base } from '../../src/Base'
import firebase from 'firebase'
import { firebaseConfig } from '../../.env'

firebase.initializeApp(firebaseConfig)
export const _db = firebase.firestore()

export class Application<T extends Record<string, unknown>> extends Base<T> {
  get baseProps(): typeof Base.prototype.props {
    return {
      db: _db,
    }
  }
}
