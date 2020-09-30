import { Application } from './Application'

type TUser = {
  name: string
}

/**
 * @example
 * const userData = await new User(userId).find()
 */
export class User extends Application<TUser> {
  get props(): typeof Application.prototype.props {
    return {
      collectionName: 'users',
    }
  }
}
