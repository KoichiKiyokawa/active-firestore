import { firestore } from 'firebase'
import { mergeIdFromSnap } from './helper'
import { BaseObject, WithId } from './types'

export class Query<T extends BaseObject> {
  constructor(private query: firestore.Query, private converter: (data: BaseObject) => BaseObject) {}

  async get(): Promise<WithId<T>[]> {
    const snap = await this.query.get()
    return snap.docs.flatMap((doc) => {
      const data = mergeIdFromSnap(doc)
      if (data === undefined) return []

      return this.converter(data) as WithId<T>
    })
  }

  limit(num: number): this {
    this.query = this.query.limit(num)
    return this
  }

  limitToLast(num: number): this {
    this.query = this.query.limitToLast(num)
    return this
  }

  orderBy(field: string, direction?: firestore.OrderByDirection): this {
    this.query.orderBy(field, direction)
    return this
  }

  where(field: string, operator: firestore.WhereFilterOp, value: string | number | Date | null): this {
    this.query.where(field, operator, value)
    return this
  }
}
