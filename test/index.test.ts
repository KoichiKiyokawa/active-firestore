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
      user2Id = await new User().create(user2Data)
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

    const userRenamedData = { name: 'user1-renamed' }
    test('User.prototype.update (rename user1)', async () => {
      const result = await new User(userId).update(userRenamedData)
      expect(result).toBeUndefined()

      const updatedData = await db
        .doc(`users/${userId}`)
        .get()
        .then((snap) => snap.data())
      expect(updatedData).toEqual(userRenamedData)
    })

    test('User.prototype.delete (delete user2)', async () => {
      const result = await new User(user2Id).destroy()
      expect(result).toBeUndefined()

      const usersData = await db
        .collection('users')
        .get()
        .then((snap) => snap.docs.map((doc) => doc.data()))
      expect(usersData).toEqual([userRenamedData])
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

    let post2Id: string
    const post2Data = { title: 'title2', body: 'body2' }
    test('Post.prototype.create (add post2)', async () => {
      post2Id = await new Post([userId]).create(post2Data)
      expect(post2Id).toBeDefined()
      const savedData = await db
        .doc(`users/${userId}/posts/${post2Id}`)
        .get()
        .then((snap) => snap.data())
      expect(savedData).toEqual(post2Data)
    })

    test('Post.prototype.all', async () => {
      const userData = await new Post([userId]).all()
      const byIdAsc = (postA: { id: string }, postB: { id: string }) => (postA.id < postB.id ? -1 : 1)
      expect(userData).toEqual(
        [
          { ...post2Data, id: post2Id },
          { ...postSeedData, id: postId },
        ].sort(byIdAsc)
      )
    })

    const postChangedData = { title: 'title1-changed', body: 'body1-changed' }
    test('Post.prototype.update (rename user1)', async () => {
      const result = await new Post([userId], postId).update(postChangedData)
      expect(result).toBeUndefined()

      const updatedData = await db
        .doc(`users/${userId}/posts/${postId}`)
        .get()
        .then((snap) => snap.data())
      expect(updatedData).toEqual(postChangedData)
    })

    test('Post.prototype.delete (delete post2)', async () => {
      const result = await new Post([userId], post2Id).destroy()
      expect(result).toBeUndefined()

      const postsData = await db
        .doc(`users/${userId}`)
        .collection('posts')
        .get()
        .then((snap) => snap.docs.map((doc) => doc.data()))
      expect(postsData).toEqual([postChangedData])
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
