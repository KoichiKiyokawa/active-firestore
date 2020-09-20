import { Post } from './models/Post'
import { User } from './models/User'

const userId = 'USER_ID'
const postId = 'POST_ID'

test('User class has db property', () => {
  const user = new User(userId)
  expect(user.db).toBeDefined()
})

test('instantiate User', () => {
  const user = new User(userId)
  expect(user.collectionName).toBe('users')
})

test('instantiate by new Post(userId, postId)', () => {
  const post = new Post(userId, postId)
  expect(post.collectionName).toBe('posts')
})

test('instantiate by new Post([userId], postId)', () => {
  const post = new Post([userId], postId)
  expect(post.collectionName).toBe('posts')
})
