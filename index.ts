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

export async function* push<T>(
    iterable: AsyncIterableLike<T>,
    value: T | Promise<T>
): AsyncIterable<T> {
    for await (const element of await iterable) {
        yield element;
    }

    yield await value;
}

export const asyncPush = push;

export function pushFn<T>(
    value: T | Promise<T>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => push(iterable, value);
}

export const asyncPushFn = pushFn;

export async function* unshift<T>(
    iterable: AsyncIterableLike<T>,
    value: T | Promise<T>
): AsyncIterable<T> {
    yield await value;

    for await (const element of await iterable) {
        yield element;
    }
}

export const asyncUnshift = unshift;

export function unshiftFn<T>(
    value: T | Promise<T>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
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

export async function* take<T>(
    iterable: AsyncIterableLike<T>,
    count: number | Promise<number>
): AsyncIterable<T> {
    const c = await count;
    if (c === 0) {
        return;
    }

    let i = 0;

    for await (const element of await iterable) {
        yield element;
        if (++i >= c) {
            return;
        }
    }
}

export const asyncTake = take;

export function takeFn<T>(
    count: number | Promise<number>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => take(iterable, count);
}

export const asyncTakeFn = takeFn;

export async function* drop<T>(iterable: AsyncIterableLike<T>, count: number): AsyncIterable<T> {
    const iterator = asyncIterator(iterable);
    let result = await iterator.next();
    for (let i = 0; i < count && result.done !== true; ++i) {
        result = await iterator.next();
    }

    while (result.done !== true) {
        yield result.value;
        result = await iterator.next();
    }
}

export const asyncDrop = drop;

export function dropFn<T>(count: number): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => drop(iterable, count);
}

export const asyncDropFn = dropFn;

export function takeWhile<T, U extends T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => element is U
): AsyncIterable<U>;
export function takeWhile<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean
): AsyncIterable<T>;
export async function* takeWhile<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean
): AsyncIterable<T> {
    let i = 0;
    for await (const element of await iterable) {
        if (!predicate(element, i)) {
            return;
        }
        yield element;
        ++i;
    }
}

export const asyncTakeWhile = takeWhile;

export function takeWhileFn<T, U extends T>(
    predicate: (element: T, index: number) => element is U
): (iterable: AsyncIterableLike<T>) => AsyncIterable<U>;
export function takeWhileFn<T>(
    predicate: (element: T, index: number) => boolean
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T>;
export function takeWhileFn<T>(
    predicate: (element: T, index: number) => boolean
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => takeWhile(iterable, predicate);
}

export const asyncTakeWhileFn = takeWhileFn;

export function takeUntil<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean
): AsyncIterable<T> {
    return takeWhile(iterable, (element, index) => !predicate(element, index));
}

export const asyncTakeUntil = takeUntil;

export function takeUntilFn<T>(
    predicate: (element: T, index: number) => boolean
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => takeUntil(iterable, predicate);
}

export const asyncTakeUntilFn = takeUntilFn;

export async function* dropWhile<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean
): AsyncIterable<T> {
    const iterator = asyncIterator(iterable);
    let result = await iterator.next();
    for (let i = 0; result.done !== true && predicate(result.value, i); ++i) {
        result = await iterator.next();
    }

    while (result.done !== true) {
        yield result.value;
        result = await iterator.next();
    }
}

export const asyncDropWhile = dropWhile;

export function dropWhileFn<T>(
    predicate: (element: T, index: number) => boolean
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => dropWhile(iterable, predicate);
}

export function dropUntil<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean
): AsyncIterable<T> {
    return dropWhile(iterable, (element, index) => !predicate(element, index));
}

export const asyncDropUntil = dropUntil;

export function dropUntilFn<T>(
    predicate: (element: T, index: number) => boolean
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => dropUntil(iterable, predicate);
}

export const asyncDropUntilFn = dropUntilFn;
