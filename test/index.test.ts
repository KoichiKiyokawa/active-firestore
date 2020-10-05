import * as firebase from '@firebase/testing'
import { User } from './models/User'
import { Post } from './models/Post'
import { Comment } from './models/Comment'
import { firebaseConfig } from './plugins/firebase'
import { db } from './plugins/firebase'

const byIdAsc = (dataA: { id: string }, dataB: { id: string }) => (dataA.id < dataB.id ? -1 : 1)

describe('firestore test', () => {
  const userId = 'USER_ID'
  const postId = 'POST_ID'
  const commentId = 'COMMENT_ID'

  describe('User test', () => {
    const userSeedData = { name: 'user1' }
    beforeAll(async () => {
      await firebase.clearFirestoreData(firebaseConfig)
      await db.doc(`users/${userId}`).set(userSeedData)
    })
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

    const user3Id = 'USER_ID3'
    const user3Data = { name: 'user3' }
    test('User.prototype.create (add user3 with ID)', async () => {
      const returnedID = await new User().create({ ...user3Data, id: user3Id })
      expect(returnedID).toBe(user3Id)
      const savedData = await db
        .doc(`users/${user3Id}`)
        .get()
        .then((snap) => snap.data())
      expect(savedData).toEqual(user3Data)
    })

    test('User.prototype.all (get user1, user2 and user3)', async () => {
      const userData = await new User().all()
      expect(userData).toEqual(
        [
          { ...user2Data, id: user2Id },
          { ...user3Data, id: user3Id },
          { ...userSeedData, id: userId },
        ].sort(byIdAsc)
      )
    })

    test('User.prototype.all (with limit)', async () => {
      const userData = await new User().all({ limit: 1 })
      expect([
        { ...user2Data, id: user2Id },
        { ...user3Data, id: user3Id },
        { ...userSeedData, id: userId },
      ]).toEqual(expect.arrayContaining(userData))
      expect(userData).toHaveLength(1)
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
      expect(usersData).toEqual([userRenamedData, user3Data])
    })
  })

  describe('Post test', () => {
    const postSeedData = { title: 'title1', body: 'body1' }
    beforeAll(async () => {
      await db.doc(`users/${userId}/posts/${postId}`).set(postSeedData)
    })
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

    test('Post.prototype.all (get post1 and post2)', async () => {
      const postData = await new Post([userId]).all()
      expect(postData).toEqual(
        [
          { ...post2Data, id: post2Id },
          { ...postSeedData, id: postId },
        ].sort(byIdAsc)
      )
    })

    test('Post.prototype.all (with limit)', async () => {
      const postData = await new Post([userId]).all({ limit: 1 })
      expect([
        { ...post2Data, id: post2Id },
        { ...postSeedData, id: postId },
      ]).toEqual(expect.arrayContaining(postData))
      expect(postData).toHaveLength(1)
    })

    const postChangedData = { title: 'title1-changed', body: 'body1-changed' }
    test('Post.prototype.update (rename post1)', async () => {
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
    const commentSeedData = { text: 'comment1' }
    beforeAll(async () => {
      await db.doc(`users/${userId}/posts/${postId}/comments/${commentId}`).set(commentSeedData)
    })
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

    let comment2Id: string
    const comment2Data = { text: 'comment2' }
    test('Comment.prototype.create (add comment2)', async () => {
      comment2Id = await new Comment([userId, postId]).create(comment2Data)
      expect(comment2Id).toBeDefined()
      const savedData = await db
        .doc(`users/${userId}/posts/${postId}/comments/${comment2Id}`)
        .get()
        .then((snap) => snap.data())
      expect(savedData).toEqual(comment2Data)
    })

    test('Comment.prototype.all (get comment1 and comment2)', async () => {
      const userData = await new Comment([userId, postId], commentId).all()
      expect(userData).toEqual(
        [
          { ...comment2Data, id: comment2Id },
          { ...commentSeedData, id: commentId },
        ].sort(byIdAsc)
      )
    })

    test('Comment.prototype.all (with limit)', async () => {
      const commentData = await new Comment([userId, postId], commentId).all({ limit: 1 })
      expect([
        { ...comment2Data, id: comment2Id },
        { ...commentSeedData, id: commentId },
      ]).toEqual(expect.arrayContaining(commentData))
      expect(commentData).toHaveLength(1)
    })

    const commentChangedData = { text: 'comment1-changed' }
    test('Comment.prototype.update (rename comment1)', async () => {
      const result = await new Comment([userId, postId], commentId).update(commentChangedData)
      expect(result).toBeUndefined()

      const updatedData = await db
        .doc(`users/${userId}/posts/${postId}/comments/${commentId}`)
        .get()
        .then((snap) => snap.data())
      expect(updatedData).toEqual(commentChangedData)
    })

    test('Comment.prototype.delete (delete comment2)', async () => {
      const result = await new Comment([userId, postId], comment2Id).destroy()
      expect(result).toBeUndefined()

      const commentsData = await db
        .doc(`users/${userId}/posts/${postId}`)
        .collection('comments')
        .get()
        .then((snap) => snap.docs.map((doc) => doc.data()))
      expect(commentsData).toEqual([commentChangedData])
    })
  })
})
