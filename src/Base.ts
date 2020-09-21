import { firestore } from 'firebase/app'

const splitOthersAndLast = (ids: string[]): [string[], string | undefined] => {
  const last = ids.pop()
  const others = ids
  return [others, last]
}

type Data = Record<string, unknown>
type BaseProps = {
  collectionName?: string
  parent?: new (parentIdsOrThisId: string[] | string, id?: string) => Base<Data>
  db?: firestore.Firestore
}

export class Base<T extends Data> {
  get baseProps(): BaseProps {
    return {}
  }
  get props(): BaseProps {
    return {}
  }
  get combinedProps(): BaseProps {
    return { ...this.baseProps, ...this.props }
  }

  collectionReference: firestore.CollectionReference<T> | null
  documentReference: firestore.DocumentReference<T> | null

  constructor(parentIdsOrThisId: string[] | string, id?: string) {
    if (parentIdsOrThisId.length === 0) throw Error('Invalid initialization!')

    const parentDocumentRef = (() => {
      if (typeof parentIdsOrThisId === 'string' && id === undefined) {
        // e.g. new User(userId)
        if (this.combinedProps.db === undefined) throw Error('db does not assigned')

        return this.combinedProps.db
      }
      if (this.combinedProps.parent === undefined) throw Error('parent does not assigned')

      if (typeof parentIdsOrThisId === 'string' && id !== undefined) {
        // e.g. new Post(userId, postId)
        return new this.combinedProps.parent(parentIdsOrThisId).documentReference
      } else if (parentIdsOrThisId.length === 1) {
        // e.g. new Post([userId], postId)
        return new this.combinedProps.parent(parentIdsOrThisId[0]).documentReference
      } else if (Array.isArray(parentIdsOrThisId)) {
        // e.g. new Comment([userId, postId], commentId)
        const [grandParentIds, parentId] = splitOthersAndLast(parentIdsOrThisId)
        return new this.combinedProps.parent(grandParentIds, parentId).documentReference
      }

      return null
    })()

    if (parentDocumentRef === null) {
      this.collectionReference = null
      this.documentReference = null
      return
    }

    if (this.combinedProps.collectionName === undefined) throw Error('collectionName has not set')
    this.collectionReference = parentDocumentRef.collection(
      this.combinedProps.collectionName
    ) as firestore.CollectionReference<T>
    this.documentReference =
      id !== undefined
        ? this.collectionReference.doc(id)
        : typeof parentIdsOrThisId === 'string'
        ? this.collectionReference.doc(parentIdsOrThisId)
        : null
  }

  async add(data: T): Promise<string> {
    if (this.collectionReference === null) {
      if (this.combinedProps.parent === null)
        throw Error(`You should assign db propety.
      For example,
      firebase.initializeApp(...)
      const firestore = firebase.firestore()
      class Foo extends Base {
        db = firestore
      }
      `)

      throw Error('Parent model is not assigned')
    }
    const addedDocumentReference = await this.collectionReference.add(data)
    return addedDocumentReference.id
  }

  async get(): Promise<(T & { id: string }) | { id: string }> {
    if (this.documentReference === null) throw Error('This model does not have documentReference. Did you mean? getAll')

    const snapshot = await this.documentReference.get()
    return { ...snapshot.data(), id: snapshot.id }
  }

  async getAll(): Promise<(T & { id: string })[]> {
    if (this.collectionReference === null) throw Error()

    const snapshot = await this.collectionReference.get()
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
  }

  async update(data: Partial<T>): Promise<void> {
    if (this.documentReference === null) throw Error('This model does not have documentReference.')

    return this.documentReference.update(data)
  }

  async delete(): Promise<void> {
    if (this.documentReference === null) throw Error('This model does not have documentReference.')

    return this.documentReference.delete()
  }
}
