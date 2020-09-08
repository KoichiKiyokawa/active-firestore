import { firestore } from "firebase/app";
export class Base<T extends object> {
  collectionName: string = "";
  parent: typeof Base | null = null;
  childModel: typeof Base | null = null;
  db!: firestore.Firestore;

  collectionReference: firestore.CollectionReference<T>;
  documentReference: firestore.DocumentReference<T> | null;

  constructor(parentIdsOrThisId: string[] | string, id?: string) {
    if (typeof parentIdsOrThisId === "string" && id)
      throw Error("Invalid initialization!");

    const parentDocumentReference =
      typeof parentIdsOrThisId === "string"
        ? this.db
        : new this.parent!(parentIdsOrThisId, id).documentReference!;
    this.collectionReference = parentDocumentReference.collection(
      this.collectionName
    ) as firestore.CollectionReference<T>;

    if (id) {
      this.documentReference = this.collectionReference.doc(
        id
      ) as firestore.DocumentReference<T>;
    } else if (typeof parentIdsOrThisId === "string") {
      // e.g. new Base('id')
      this.documentReference = this.collectionReference.doc(parentIdsOrThisId);
    } else {
      this.documentReference = null;
    }
  }

  async add(data: T): Promise<string> {
    const addedDocumentReference = await this.collectionReference.add(data);
    return addedDocumentReference.id;
  }

  async get(): Promise<T & { id: string }> {
    if (this.documentReference === null)
      throw Error(
        "This model does not have documentReference. Did you mean? getAll"
      );

    const snapshot = await this.documentReference.get();
    return { ...snapshot.data()!, id: snapshot.id };
  }

  async getAll(): Promise<(T & { id: string })[]> {
    const snapshot = await this.collectionReference.get();
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  }

  async update(data: Partial<T>): Promise<void> {
    if (this.documentReference === null)
      throw Error("This model does not have documentReference.");

    return this.documentReference.update(data);
  }

  async delete(): Promise<void> {
    if (this.documentReference === null)
      throw Error("This model does not have documentReference.");

    return this.documentReference.delete();
  }
}
