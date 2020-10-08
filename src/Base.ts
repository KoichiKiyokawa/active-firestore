import { firestore } from 'firebase/app'
import { BaseRepository } from './BaseRepository'
import { ERRORS } from './errors'
import { BaseObject } from './types'

type BaseProps = {
  collectionName?: string
  parent?: new (parentIdsOrThisId?: string | [string, ...string[]], id?: string) => Base<BaseObject>
  db?: firestore.Firestore
}

export class Base<T extends BaseObject> extends BaseRepository<T> {
  get baseProps(): BaseProps {
    return {}
  }
  get props(): BaseProps {
    return {}
  }
  get combinedProps(): BaseProps {
    return { ...this.baseProps, ...this.props }
  }

  constructor(parentIdsOrThisId?: string | [string, ...string[]], id?: string) {
    super()
    if (this.combinedProps.db === undefined) throw Error('db does not assigned')
    if (this.combinedProps.collectionName === undefined) throw Error('collectionName has not set')

    const parentDocumentRef: firestore.Firestore | firestore.DocumentReference<BaseObject> | undefined = (() => {
      /**
       * parentIdsOrThisId: 3 patterns (undefined, string, [string, ...string[]])
       *                         x
       *       id         : 2 patterns (undefined, string)
       *                         ||
       *                    6 patterns
       */
      if (parentIdsOrThisId === undefined) {
        if (id === undefined) {
          // e.g. new User()
          return this.combinedProps.db
        } else if (typeof id === 'string') {
          // e.g. new User(undefined, userId)
          throw ERRORS.INVALID_ARGS()
        }
      } else if (typeof parentIdsOrThisId === 'string') {
        if (id === undefined) {
          // e.g. new User(userId)
          return this.combinedProps.db
        } else if (typeof id === 'string') {
          // e.g. new Post(userId, postId)
          throw ERRORS.INVALID_ARGS()
        }
      } else if (Array.isArray(parentIdsOrThisId)) {
        if (this.combinedProps.parent === undefined) throw ERRORS.NO_PARENT()
        // e.g. 1 new Post([userId]) or new Post([userId], postId)
        // or
        // e.g. 2. new Comment([userId, postId]) or new Comment([userId, postId], commentId)
        if (parentIdsOrThisId.length === 1) {
          // e.g. 1 new Post([userId]) or new Post([userId], postId)
          const [parentId] = parentIdsOrThisId
          return new this.combinedProps.parent(parentId).documentReference
        } else {
          // e.g. 2 new Comment([userId, postId]) or new Comment([userId, postId], commentId)
          const grandParentIds = parentIdsOrThisId.slice(0, -1) as [string, ...string[]]
          const [parentId] = parentIdsOrThisId.slice(-1)
          return new this.combinedProps.parent(grandParentIds, parentId).documentReference
        }
      }
    })()

    this.collectionReference = parentDocumentRef?.collection(
      this.combinedProps.collectionName
    ) as firestore.CollectionReference<T>

    this.documentReference =
      id !== undefined
        ? this.collectionReference.doc(id)
        : typeof parentIdsOrThisId === 'string'
        ? this.collectionReference.doc(parentIdsOrThisId)
        : undefined
  }
}
