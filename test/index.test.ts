import { Post } from './models/Post'
import { User } from './models/User'

const userId = 'USER_ID'
const postId = 'POST_ID'

test('instantiate User', () => {
  const user = new User(userId)
  expect(user.props.collectionName).toBe('users')
  expect(user.documentReference?.path).toBe(`users/${userId}`)
})

test('instantiate by new Post(userId, postId)', () => {
  const post = new Post(userId, postId)
  expect(post.props.collectionName).toBe('posts')
  expect(post.documentReference?.path).toBe(`users/${userId}/posts/${postId}`)
})

test('instantiate by new Post([userId], postId)', () => {
  const post = new Post([userId], postId)
  expect(post.props.collectionName).toBe('posts')
  expect(post.documentReference?.path).toBe(`users/${userId}/posts/${postId}`)
})
