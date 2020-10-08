import { Application } from './Application'

type Post = {
  postedAt: Date
  obj1: {
    obj2: {
      obj3: {
        date: Date
      }
    }
  }
}

type User = {
  posts: Post[]
}

type TNested = {
  users: User[]
}

export class Nested extends Application<TNested> {
  get props(): typeof Application.prototype.props {
    return { collectionName: 'nested' }
  }
}
