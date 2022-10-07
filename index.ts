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

export async function* unshift<T>(iterable: AsyncIterableLike<T>, value: T): AsyncIterable<T> {
    yield value;

    for await (const element of await iterable) {
        yield element;
    }
}

export const asyncUnshift = unshift;

export function unshiftFn<T>(value: T): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => unshift(iterable, value);
}

export const asyncUnshiftFn = unshiftFn;

export async function* initial<T>(iterable: AsyncIterable<T>): AsyncIterable<T> {
    const iterator = asyncIterator(iterable);
    let prev = await iterator.next();
    let element = prev.done === true ? prev : await iterator.next();

    while (element.done !== true) {
        yield prev.value;
        prev = element;
        element = await iterator.next();
    }
}

export const asyncInitial = initial;

export async function last<T>(iterable: AsyncIterableLike<T>): Promise<T | null> {
    let last: T | null = null;

    for await (const element of await iterable) {
        last = element;
    }

    return last;
}

export const asyncLast = last;

export async function only<T>(iterable: AsyncIterableLike<T>): Promise<T | null> {
    const iterator = asyncIterator(iterable);
    const first = await iterator.next();

    return !(first.done ?? false) && ((await iterator.next()).done ?? false) ? first.value : null;
}

export const asyncOnly = only;

export async function empty(iterable: AsyncIterableLike<unknown>): Promise<boolean> {
    return (await asyncIterator(iterable).next()).done === true;
}

export const asyncEmpty = empty;

export async function notEmpty(iterable: AsyncIterableLike<unknown>): Promise<boolean> {
    return !(await empty(iterable));
}

export const asyncNotEmpty = notEmpty;

export async function* take<T>(iterable: AsyncIterableLike<T>, count: number): AsyncIterable<T> {
    if (count === 0) {
        return;
    }

    let i = 0;

    for await (const element of await iterable) {
        yield element;
        if (++i >= count) {
            return;
        }
    }
}

export const asyncTake = take;

export function takeFn<T>(count: number): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => take(iterable, count);
}

export const asyncTakeFn = takeFn;
