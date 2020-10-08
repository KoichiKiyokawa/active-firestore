import { firestore } from 'firebase'
import { BaseObject, WithId } from './types'

export function mergeIdFromSnap<T>(snap: firestore.DocumentSnapshot<T>): WithId<T> | undefined {
  const data = snap.data()
  if (!data) return undefined
  return { ...data, id: snap.id }
}

export function convertTimestampToDate(data: BaseObject): BaseObject {
  return Object.fromEntries(
    Object.entries(data).map(([key, val]) => {
      if (val instanceof firestore.Timestamp) return [key, val.toDate()]
      else if (Array.isArray(val))
        return [
          key,
          val.map((v) => (v instanceof firestore.Timestamp ? v.toDate() : isObject(v) ? convertTimestampToDate(v) : v)),
        ]
      else if (isObject(val)) return [key, convertTimestampToDate(val)]
      else return [key, val]
    })
  )
}

// cf) https://qiita.com/suin/items/e8cf3404161cc90821d8
export function isObject(x: unknown): x is BaseObject {
  if (x === null) return false
  else if (typeof x === 'object') return true
  else return false
}
