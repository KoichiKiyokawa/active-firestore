import { RootCollection } from './RootCollection'

type TUser = {
  id: string
  name: string
}

export class User extends RootCollection<TUser> {
  get collectionName(): string {
    return 'users'
  }
}
