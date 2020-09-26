const ERROR_PREFIX = '[ActiveFirestore]'

export const ERRORS: Record<string, (additionalMessage?: string) => Error> = {
  INVALID_ARGS: (additionalMessage?: string) => Error(`${ERROR_PREFIX}invalid args. ${additionalMessage}`),
  NO_PARENT: () => Error(`${ERROR_PREFIX}parent is not set.`),
  NO_COLLECTION_REFERENCE: (additionalMessage?: string) =>
    Error(`This model does not have collectionReference. ${additionalMessage}`),
  NO_DOCUMENT_REFERENCE: (additionalMessage?: string) =>
    Error(`This model does not have documentReference. ${additionalMessage}`),
}
