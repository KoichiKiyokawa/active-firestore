import { RootCollection } from './RootCollection'
import { User } from './User'

type TPost = {
  id: string
  title: string
  body: string
}

export class Post extends RootCollection<TPost> {
  get collectionName(): string {
    return 'posts'
  }

  get parent(): typeof User {
    return User
  }
}
