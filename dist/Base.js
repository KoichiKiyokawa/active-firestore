"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base = void 0;
const splitOthersAndLast = (ids) => {
    const last = ids.pop();
    const others = ids;
    return [others, last];
};
class Base {
    constructor(parentIdsOrThisId, id) {
        if (parentIdsOrThisId.length === 0)
            throw Error('Invalid initialization!');
        const parentDocumentRef = (() => {
            if (typeof parentIdsOrThisId === 'string' && id === undefined) {
                // e.g. new User(userId)
                if (this.combinedProps.db === undefined)
                    throw Error('db does not assigned');
                return this.combinedProps.db;
            }
            if (this.combinedProps.parent === undefined)
                throw Error('parent does not assigned');
            if (typeof parentIdsOrThisId === 'string' && id !== undefined) {
                // e.g. new Post(userId, postId)
                return new this.combinedProps.parent(parentIdsOrThisId).documentReference;
            }
            else if (parentIdsOrThisId.length === 1) {
                // e.g. new Post([userId], postId)
                return new this.combinedProps.parent(parentIdsOrThisId[0]).documentReference;
            }
            else if (Array.isArray(parentIdsOrThisId)) {
                // e.g. new Comment([userId, postId], commentId)
                const [grandParentIds, parentId] = splitOthersAndLast(parentIdsOrThisId);
                return new this.combinedProps.parent(grandParentIds, parentId).documentReference;
            }
            return null;
        })();
        if (parentDocumentRef === null) {
            this.collectionReference = null;
            this.documentReference = null;
            return;
        }
        if (this.combinedProps.collectionName === undefined)
            throw Error('collectionName has not set');
        this.collectionReference = parentDocumentRef.collection(this.combinedProps.collectionName);
        this.documentReference =
            id !== undefined
                ? this.collectionReference.doc(id)
                : typeof parentIdsOrThisId === 'string'
                    ? this.collectionReference.doc(parentIdsOrThisId)
                    : null;
    }
    get baseProps() {
        return {};
    }
    get props() {
        return {};
    }
    get combinedProps() {
        return Object.assign(Object.assign({}, this.baseProps), this.props);
    }
    add(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.collectionReference === null) {
                if (this.combinedProps.parent === null)
                    throw Error(`You should assign db propety.
      For example,
      firebase.initializeApp(...)
      const firestore = firebase.firestore()
      class Foo extends Base {
        db = firestore
      }
      `);
                throw Error('Parent model is not assigned');
            }
            const addedDocumentReference = yield this.collectionReference.add(data);
            return addedDocumentReference.id;
        });
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.documentReference === null)
                throw Error('This model does not have documentReference. Did you mean? getAll');
            const snapshot = yield this.documentReference.get();
            return Object.assign(Object.assign({}, snapshot.data()), { id: snapshot.id });
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.collectionReference === null)
                throw Error();
            const snapshot = yield this.collectionReference.get();
            return snapshot.docs.map((doc) => (Object.assign(Object.assign({}, doc.data()), { id: doc.id })));
        });
    }
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.documentReference === null)
                throw Error('This model does not have documentReference.');
            return this.documentReference.update(data);
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.documentReference === null)
                throw Error('This model does not have documentReference.');
            return this.documentReference.delete();
        });
    }
}
exports.Base = Base;
