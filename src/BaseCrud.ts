import { firestore } from 'firebase/app'
import { ERRORS } from './errors'

type WithId<T> = T & { id: string }

export class BaseCrud<T extends Record<string, unknown>> {
  collectionReference?: firestore.CollectionReference<T>
  documentReference?: firestore.DocumentReference<T>

  /**
   * @return {Promise<string>} id
   */
  async create(data: T & { id?: string }): Promise<string> {
    if (this.collectionReference == null) throw ERRORS.NO_COLLECTION_REFERENCE

    const { id, ...addData } = data
    if (id) {
      await this.collectionReference.doc(id).set(addData as T)
      return id
    }

    const addedDocumentReference = await this.collectionReference.add(addData as T)
    return addedDocumentReference.id
  }

  async find(): Promise<WithId<T> | undefined> {
    if (this.documentReference == null) throw ERRORS.NO_DOCUMENT_REFERENCE('Did you mean? getAll')

    const snap = await this.documentReference.get()
    const data = this.mergeIdToSnap(snap)
    return this.convertFromDbData(data)
  }

  async all(arg?: { limit: number }): Promise<WithId<T>[]> {
    if (this.collectionReference == null) throw Error()

    const snapshot = await (arg ? this.collectionReference.limit(arg.limit) : this.collectionReference).get()
    return snapshot.docs.flatMap((doc) => this.convertFromDbData(this.mergeIdToSnap(doc)) ?? [])
  }

  async update(data: Partial<T>): Promise<void> {
    if (this.documentReference == null) throw ERRORS.NO_DOCUMENT_REFERENCE()

    return this.documentReference.update(data)
  }

  async destroy(): Promise<void> {
    if (this.documentReference == null) throw ERRORS.NO_DOCUMENT_REFERENCE()

    return this.documentReference.delete()
  }

  private mergeIdToSnap(snap: firestore.DocumentSnapshot<T>) {
    const data = snap.data()
    if (!data) return undefined
    return { ...data, id: snap.id }
  }

  private convertFromDbData(data: Record<string, unknown> | undefined): WithId<T> | undefined {
    if (!data) return undefined

    return Object.fromEntries(
      Object.entries(data).map(([key, val]) => {
        if (val instanceof firestore.Timestamp) return [key, val.toDate()]
        else if (Array.isArray(val))
          return [
            key,
            val.map((v) =>
              v instanceof firestore.Timestamp ? v.toDate() : isObject(v) ? this.convertFromDbData(v) : v
            ),
          ]
        else if (isObject(val)) return [key, this.convertFromDbData(val)]
        else return [key, val]
      })
    ) as WithId<T>
  }
}

// cf) https://qiita.com/suin/items/e8cf3404161cc90821d8
const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && (typeof x === 'object' || typeof x === 'function')
