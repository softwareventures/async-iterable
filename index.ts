export type AsyncIterableLike<T> =
    | AsyncIterable<T>
    | Iterable<T | Promise<T>>
    | Promise<AsyncIterable<T>>
    | Promise<Iterable<T | Promise<T>>>;
