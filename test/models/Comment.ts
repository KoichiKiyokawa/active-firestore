import { Application } from './Application'
import { Post } from './Post'

type TComment = {
  text: string
}

/**
 * @example
 * const commentData = await new Comment(userId, postId, commentId).find()
 */
export class Comment extends Application<TComment> {
  get props(): typeof Application.prototype.props {
    return {
      collectionName: 'comments',
      parent: Post,
    }
  }
}
