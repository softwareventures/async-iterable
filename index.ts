export type AsyncIterableLike<T> =
    | AsyncIterable<T>
    | Iterable<T | Promise<T>>
    | Promise<AsyncIterable<T>>
    | Promise<Iterable<T | Promise<T>>>;

export async function* asyncIterable<T>(iterable: AsyncIterableLike<T>): AsyncIterable<T> {
    for await (const element of await iterable) {
        yield element;
    }
}

export function asyncIterator<T>(iterable: AsyncIterableLike<T>): AsyncIterator<T> {
    return asyncIterable(iterable)[Symbol.asyncIterator]();
}

export function isAsyncIterable<T = unknown>(
    value: AsyncIterable<T> | unknown
): value is AsyncIterable<T> {
    return typeof value === "object" && value != null && Symbol.asyncIterator in value;
}

export async function toArray<T>(iterable: AsyncIterableLike<T>): Promise<T[]> {
    const array: T[] = [];
    for await (const element of await iterable) {
        array.push(element);
    }
    return array;
}

export const asyncToArray = toArray;

export async function first<T>(iterable: AsyncIterableLike<T>): Promise<T | null> {
    for await (const element of await iterable) {
        return element;
    }

    return null;
}

export const asyncFirst = first;

export async function* tail<T>(iterable: AsyncIterableLike<T>): AsyncIterable<T> {
    const iterator = asyncIterator(iterable);
    await iterator.next();

    let result = await iterator.next();
    while (result.done !== true) {
        yield result.value;
        result = await iterator.next();
    }
}

export const asyncTail = tail;

export async function* push<T>(iterable: AsyncIterableLike<T>, value: T): AsyncIterable<T> {
    for await (const element of await iterable) {
        yield element;
    }

    yield value;
}

export const asyncPush = push;

export function pushFn<T>(value: T): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => push(iterable, value);
}

export const asyncPushFn = pushFn;
