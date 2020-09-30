import * as firebase from '@firebase/testing'
import { User } from './models/User'
import { Post } from './models/Post'
import { Comment } from './models/Comment'
import { firebaseConfig } from './plugins/firebase'
import { db } from './plugins/firebase'

describe('firestore test', () => {
  const userId = 'USER_ID'
  const postId = 'POST_ID'
  const commentId = 'COMMENT_ID'

  const userSeedData = { name: 'user1' }
  const postSeedData = { title: 'title1', body: 'body1' }
  beforeAll(async () => {
    await firebase.clearFirestoreData(firebaseConfig)
    await db.doc(`users/${userId}`).set(userSeedData)
    await db.doc(`users/${userId}/posts/${postId}`).set(postSeedData)
  })

  describe('User test', () => {
    test('instantiate User', () => {
      const user = new User(userId)
      expect(user.props.collectionName).toBe('users')
      expect(user.documentReference?.path).toBe(`users/${userId}`)
    })

    test('instantiate User (without id)', () => {
      const user = new User()
      expect(user.props.collectionName).toBe('users')
      expect(user.collectionReference?.path).toBe('users')
      expect(user.documentReference).toBeUndefined()
    })

    test('User.prototype.get', async () => {
      const userData = await new User(userId).find()
      expect(userData).toEqual({ ...userSeedData, id: userId })
    })

    let user2Id: string
    const user2Data = { name: 'user2' }
    test('User.prototype.create (add user2)', async () => {
      user2Id = await new User(userId).create(user2Data)
      expect(user2Id).toBeDefined()
      const savedData = await db
        .doc(`users/${user2Id}`)
        .get()
        .then((snap) => snap.data())
      expect(savedData).toEqual(user2Data)
    })

    test('User.prototype.all', async () => {
      const userData = await new User().all()
      const byIdAsc = (userA: { id: string }, userB: { id: string }) => (userA.id < userB.id ? -1 : 1)
      expect(userData).toEqual(
        [
          { ...user2Data, id: user2Id },
          { ...userSeedData, id: userId },
        ].sort(byIdAsc)
      )
    })
  })

  describe('Post test', () => {
    test('instantiate by new Post([userId], postId)', () => {
      const post = new Post([userId], postId)
      expect(post.props.collectionName).toBe('posts')
      expect(post.documentReference?.path).toBe(`users/${userId}/posts/${postId}`)
    })

    test('instantiate by new Post([userId])', () => {
      const post = new Post([userId])
      expect(post.props.collectionName).toBe('posts')
      expect(post.collectionReference?.path).toBe(`users/${userId}/posts`)
    })
  })

  describe('Comment test', () => {
    test('instantiate by new Comment([userId, postId], commentId)', () => {
      const comment = new Comment([userId, postId], commentId)
      expect(comment.props.collectionName).toBe('comments')
      expect(comment.documentReference?.path).toBe(`users/${userId}/posts/${postId}/comments/${commentId}`)
    })

    test('instantiate by new Comment([userId, postId])', () => {
      const comment = new Comment([userId, postId])
      expect(comment.props.collectionName).toBe('comments')
      expect(comment.collectionReference?.path).toBe(`users/${userId}/posts/${postId}/comments`)
    })
  })
})
