import { Post } from './models/Post'
import { User } from './models/User'

test('User class has db property', () => {
  const user = new User('userId')
  expect(user.db).toBeDefined()
})

test('instantiate User', () => {
  const user = new User('userId')
  expect(user.collectionName).toBe('users')
})

