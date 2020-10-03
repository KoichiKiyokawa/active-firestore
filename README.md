# active-firestore
![CI](https://github.com/KoichiKiyokawa/active-firestore/workflows/CI/badge.svg?branch=master)
[![codecov](https://codecov.io/gh/KoichiKiyokawa/active-firestore/branch/master/graph/badge.svg?token=EVDB1JVVHJ)](undefined)
![](https://badgen.net/npm/v/active-firestore)
![](https://badgen.net/bundlephobia/minzip/active-firestore)
![](https://badgen.net/npm/dt/active-firestore)

Firestore sdk which has ActiveRecord like syntax

## Features
- 🚀 No dependencies
- ⚡️ Lightweight
- ✏️ Less code
- 💪 Type strong(Written in TypeScript)
- 🔧 Customizable(You can add any methods you want)
- 📚 Usable in nested collections

## Usage
1. Install this npm package:
```shell
yarn add active-firestore
# or npm intall active-firestore
```
2. [Initialize](https://firebase.google.com/docs/web/setup#add-sdks-initialize) your Firebase SDK
```ts
/* src/plugins/firestore.ts */
import * as firebase from 'firebase/app'
import 'firebase/firestore'

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  // ...
};

if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig)
export const db = firebase.firestore() 
```
3. Add Application model to your project.
```ts
/* src/models/Application.ts */
import { Base } from 'active-firestore'
import { db } from '../plugins/firebase'

export class Application<T extends Record<string, unknown>> extends Base<T> {
  get baseProps(): typeof Base.prototype.props {
    return { db }
  }
}
```
4. Set model files depending on your firestore design.
For example,
- **root collection: users**
  - name: string
  - **child collection: posts**
    - title: string
    - body: string

```ts
/* src/models/User.ts */
import { Application } from './Application'

type TUser = {
  name: string
}

export class User extends Application<TUser> {
  get props(): typeof Application.prototype.props {
    return {
      collectionName: 'users',
    }
  }
}
```

```ts
/* src/models/Post.ts */
import { Application } from './Application'
import { User } from './User'

type TPost = {
  title: string
  body: string
}

export class Post extends Application<TPost> {
  get props(): typeof Application.prototype.props {
    return {
      collectionName: 'posts',
      parent: User, // Set parent model
    }
  }
}
```

5. 🎉 Let's get data with simple API.
```ts
/* src/index.ts */
import { User } from '../models/User'
import { Post } from '../models/Post'

const userId = 'USER_ID'
const userDAO = new User(userId)
// Create
await userDAO.create({ name: 'user1' })
// Read
const userData = await userDAO.find()
// Update
await userDAO.update({ name: 'user1-renamed' })
// Delete
await userDAO.destroy()

const postId = 'POST_ID'
const postDAO = new Post([userId], postId) // Path parent documentID in array
// Create
await postDAO.create({ title: 'title1', body: 'body1' })
// Read
const postData = await postDAO.find()
// Update
await postDAO.update({ title: 'title1-changed', body: 'body1-changed' })
// Delete
await postDAO.destroy()

// More nested (Comment is Post's child)
const commentDAO = new Comment([userId, postId], commentId)
```

## Q. Why not syntax such as `Post.find`
### A. Bacause Firestore is not RDB.
In Firestore, when you get data from post collection(example given above), you need not only `postId` but also `userId`(parent documentID). So:
```ts
Post.create(userId, { title: 'title1' }) // It's confusing! You use Post but API require `userId`
Post.find(userId, postId) // Not bad...?
Post.update(userId, postId, { title: 'title-changed' }) // It's confusing!
Post.destroy(userId, postId) // It's confusing!
```
