import { firestore } from 'firebase/app'
import { ERRORS } from './errors'
import { BaseObject, WithId } from './types'
import { mergeIdFromSnap, convertTimestampToDate } from './helper'
import { Query } from './Query'

export class BaseRepository<T extends BaseObject> {
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
    const data = mergeIdFromSnap(snap)
    if (data === undefined) return undefined

    return this.convertFromDbData(data) as WithId<T>
  }

  async all(arg?: { limit: number }): Promise<WithId<T>[]> {
    if (this.collectionReference == null) throw Error()

    const snapshot = await (arg ? this.collectionReference.limit(arg.limit) : this.collectionReference).get()
    return snapshot.docs.flatMap((doc) => {
      const data = mergeIdFromSnap(doc)
      if (!data) return []

      return this.convertFromDbData(data) as WithId<T>
    })
  }

  async update(data: Partial<T>): Promise<void> {
    if (this.documentReference == null) throw ERRORS.NO_DOCUMENT_REFERENCE()

    return this.documentReference.update(data)
  }

  async destroy(): Promise<void> {
    if (this.documentReference == null) throw ERRORS.NO_DOCUMENT_REFERENCE()

    return this.documentReference.delete()
  }

  limit(num: number): Query<T> {
    if (this.collectionReference == null) throw ERRORS.NO_COLLECTION_REFERENCE()

    return this.buildQuery(this.collectionReference.limit(num))
  }

  limitToLast(num: number): Query<T> {
    if (this.collectionReference == null) throw ERRORS.NO_COLLECTION_REFERENCE()

    return this.buildQuery(this.collectionReference.limitToLast(num))
  }

  orderBy(field: string, direction?: firestore.OrderByDirection): Query<T> {
    if (this.collectionReference == null) throw ERRORS.NO_COLLECTION_REFERENCE()

    return this.buildQuery(this.collectionReference.orderBy(field, direction))
  }

  where(field: string, operator: firestore.WhereFilterOp, value: string | number | Date | null): Query<T> {
    if (this.collectionReference == null) throw ERRORS.NO_COLLECTION_REFERENCE()

    return this.buildQuery(this.collectionReference.where(field, operator, value))
  }

  protected convertFromDbData(data: BaseObject): BaseObject {
    return convertTimestampToDate(data)
  }

  private buildQuery(query: firestore.Query<T>) {
    return new Query<T>(query, this.convertFromDbData)
  }
}
