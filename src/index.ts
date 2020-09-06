import firebase from "firebase/app";

const splitIds = (ids: string[]): [string[] | null, string | null] => {
  let parentIds: string[] | null;
  let thisModelId: string | null;
  const lastIndex = ids.length - 1;
  if (ids.length === 0) {
    parentIds = null;
    thisModelId = null;
  } else if (ids.length === 1) {
    parentIds = null;
    thisModelId = ids[lastIndex];
  } else {
    parentIds = ids.slice(0, lastIndex);
    thisModelId = ids[lastIndex];
  }

  return [parentIds, thisModelId];
};

export class Base<T extends object> {
  static collectionName: string = "";
  static parentModel: typeof Base | null = null;
  static childModel: typeof Base | null = null;
  static db: firebase.firestore.Firestore;

  documentReference: firebase.firestore.DocumentReference<T>;

  constructor(...ids: string[]) {
    this.documentReference = Base.db.doc(
      Base.path(...ids)
    ) as firebase.firestore.DocumentReference<T>;
  }

  static path(...ids: string[]): string {
    const [parentIds, thisModelId] = splitIds(ids);
    const parentPath =
      parentIds === null || this.parentModel === null
        ? ""
        : this.parentModel.path(...parentIds);
    return `${parentPath}/${this.collectionName}/${thisModelId}`;
  }

  async get(): Promise<T & { id: string }> {
    const snapshot = await this.documentReference.get();
    return { ...snapshot.data()!, id: snapshot.id };
  }

  async update(data: Partial<T>): Promise<void> {
    return this.documentReference.update(data);
  }

  static async findAll<T>(...ids: string[]) {
    const docRef =
      this.parentModel === null
        ? this.db
        : new this.parentModel(...ids.splice(0, ids.length - 1))
            .documentReference;
    const snapshot = await docRef.collection(this.name).get();
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as (T & { id: string })[];
  }
}
