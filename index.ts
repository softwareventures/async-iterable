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
