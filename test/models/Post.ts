import { Application } from './Application'
import { User } from './User'

type TPost = {
  title: string
  body: string
}

/**
 * @example
 * const postData = await new Post(userId, postId).get()
 */
export class Post extends Application<TPost> {
  get props(): typeof Application.prototype.props {
    return {
      collectionName: 'posts',
      parent: User,
    }
  }
}
