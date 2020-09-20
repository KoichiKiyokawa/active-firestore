import { Application } from './Application'

type TUser = {
  id: string
  name: string
}

export class User extends Application<TUser> {
  get props(): typeof Application.prototype.props {
    return {
      collectionName: 'users',
    }
  }
}
