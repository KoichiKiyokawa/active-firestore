import { firestore } from 'firebase/app'
import { ERRORS } from './errors'

type WithId<T> = T & { id: string }

export class BaseCrud<T extends Record<string, unknown>> {
  collectionReference?: firestore.CollectionReference<T>
  documentReference?: firestore.DocumentReference<T>

  private mergeIdToSnap(snap: firestore.DocumentSnapshot<T>) {
    const data = snap.data()
    if (!data) return undefined
    return { ...data, id: snap.id }
  }

  async create(data: T): Promise<string> {
    if (this.collectionReference == null) throw ERRORS.NO_COLLECTION_REFERENCE

    const addedDocumentReference = await this.collectionReference?.add(data)
    return addedDocumentReference.id
  }

  async find(): Promise<WithId<T> | undefined> {
    if (this.documentReference == null) throw ERRORS.NO_DOCUMENT_REFERENCE('Did you mean? getAll')

    return this.documentReference.get().then((snap) => this.mergeIdToSnap(snap))
  }

  async all(arg?: { limit: number }): Promise<WithId<T>[]> {
    if (this.collectionReference == null) throw Error()

    const snapshot = await (arg ? this.collectionReference.limit(arg.limit) : this.collectionReference).get()
    return snapshot.docs.flatMap((doc) => this.mergeIdToSnap(doc) ?? [])
  }

  async update(data: Partial<T>): Promise<void> {
    if (this.documentReference == null) throw ERRORS.NO_DOCUMENT_REFERENCE()

    return this.documentReference.update(data)
  }

  async destroy(): Promise<void> {
    if (this.documentReference == null) throw ERRORS.NO_DOCUMENT_REFERENCE()

    return this.documentReference.delete()
  }
}
