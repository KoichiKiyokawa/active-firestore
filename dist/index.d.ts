import { firestore } from 'firebase/app';
declare type Data = Record<string, unknown>;
declare type BaseProps = {
    collectionName?: string;
    parent?: new (parentIdsOrThisId: string[] | string, id?: string) => Base<Data>;
    db?: firestore.Firestore;
};
export declare class Base<T extends Data> {
    get baseProps(): BaseProps;
    get props(): BaseProps;
    get combinedProps(): BaseProps;
    collectionReference: firestore.CollectionReference<T> | null;
    documentReference: firestore.DocumentReference<T> | null;
    constructor(parentIdsOrThisId: string[] | string, id?: string);
    add(data: T): Promise<string>;
    get(): Promise<(T & {
        id: string;
    }) | {
        id: string;
    }>;
    getAll(): Promise<(T & {
        id: string;
    })[]>;
    update(data: Partial<T>): Promise<void>;
    delete(): Promise<void>;
}
export {};
