import { Application } from './Application'
import { User } from './User'

type TPost = {
  id: string
  title: string
  body: string
}

/**
 * @example
 * const postData = await new Post(userId, postId).get()
 */
export class Post extends Application<TPost> {
  get collectionName(): string {
    return 'posts'
  }

  get parent(): typeof User {
    return User
  }
}
