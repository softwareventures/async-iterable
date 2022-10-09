import {equal as defaultEqual} from "@softwareventures/ordered";
import {isNotNull} from "@softwareventures/nullable";

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

export async function* drop<T>(
    iterable: AsyncIterableLike<T>,
    count: number | Promise<number>
): AsyncIterable<T> {
    const iterator = asyncIterator(iterable);
    const c = await count;
    let result = await iterator.next();
    for (let i = 0; i < c && result.done !== true; ++i) {
        result = await iterator.next();
    }

    while (result.done !== true) {
        yield result.value;
        result = await iterator.next();
    }
}

export const asyncDrop = drop;

export function dropFn<T>(
    count: number | Promise<number>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => drop(iterable, count);
}

export const asyncDropFn = dropFn;

export function takeWhile<T, U extends T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => element is U
): AsyncIterable<U>;
export function takeWhile<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): AsyncIterable<T>;
export async function* takeWhile<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): AsyncIterable<T> {
    let i = 0;
    for await (const element of await iterable) {
        if (!(await predicate(element, i))) {
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
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T>;
export function takeWhileFn<T>(
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => takeWhile(iterable, predicate);
}

export const asyncTakeWhileFn = takeWhileFn;

export function takeUntil<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): AsyncIterable<T> {
    return takeWhile(iterable, async (element, index) => !(await predicate(element, index)));
}

export const asyncTakeUntil = takeUntil;

export function takeUntilFn<T>(
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => takeUntil(iterable, predicate);
}

export const asyncTakeUntilFn = takeUntilFn;

export async function* dropWhile<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): AsyncIterable<T> {
    const iterator = asyncIterator(iterable);
    let result = await iterator.next();
    for (let i = 0; result.done !== true && (await predicate(result.value, i)); ++i) {
        result = await iterator.next();
    }

    while (result.done !== true) {
        yield result.value;
        result = await iterator.next();
    }
}

export const asyncDropWhile = dropWhile;

export function dropWhileFn<T>(
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => dropWhile(iterable, predicate);
}

export function dropUntil<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): AsyncIterable<T> {
    return dropWhile(iterable, async (element, index) => !(await predicate(element, index)));
}

export const asyncDropUntil = dropUntil;

export function dropUntilFn<T>(
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => dropUntil(iterable, predicate);
}

export const asyncDropUntilFn = dropUntilFn;

export async function equal<T>(
    a: AsyncIterableLike<T>,
    b: AsyncIterableLike<T>,
    elementsEqual: (a: T, b: T) => boolean | Promise<boolean> = defaultEqual
): Promise<boolean> {
    const ait = asyncIterator(a);
    const bit = asyncIterator(b);

    let ar = await ait.next();
    let br = await bit.next();

    while (ar.done !== true && br.done !== true) {
        if (!(await elementsEqual(ar.value, br.value))) {
            return false;
        }

        ar = await ait.next();
        br = await bit.next();
    }

    return (ar.done ?? false) && (br.done ?? false);
}

export const asyncEqual = equal;

export function equalFn<T>(
    b: AsyncIterableLike<T>,
    elementsEqual: (a: T, b: T) => boolean | Promise<boolean> = defaultEqual
): (a: AsyncIterableLike<T>) => Promise<boolean> {
    return async a => equal(a, b, elementsEqual);
}

export const asyncEqualFn = equalFn;

export async function notEqual<T>(
    a: AsyncIterableLike<T>,
    b: AsyncIterableLike<T>,
    elementsEqual: (a: T, b: T) => boolean | Promise<boolean> = defaultEqual
): Promise<boolean> {
    return !(await equal(a, b, elementsEqual));
}

export const asyncNotEqual = notEqual;

export function notEqualFn<T>(
    b: AsyncIterableLike<T>,
    elementsEqual: (a: T, b: T) => boolean | Promise<boolean> = defaultEqual
): (a: AsyncIterableLike<T>) => Promise<boolean> {
    return async a => notEqual(a, b, elementsEqual);
}

export const asyncNotEqualFn = notEqualFn;

export async function prefixMatch<T>(
    a: AsyncIterableLike<T>,
    b: AsyncIterableLike<T>,
    elementsEqual: (a: T, b: T) => boolean | Promise<boolean> = defaultEqual
): Promise<boolean> {
    const ait = asyncIterator(a);
    const bit = asyncIterator(b);

    let ar = await ait.next();
    let br = await bit.next();

    while (ar.done !== true && br.done !== true) {
        if (!(await elementsEqual(ar.value, br.value))) {
            return false;
        }

        ar = await ait.next();
        br = await bit.next();
    }

    return br.done ?? false;
}

export const asyncPrefixMatch = prefixMatch;

export function prefixMatchFn<T>(
    b: AsyncIterableLike<T>,
    elementsEqual: (a: T, b: T) => boolean | Promise<boolean> = defaultEqual
): (a: AsyncIterableLike<T>) => Promise<boolean> {
    return async a => prefixMatch(a, b, elementsEqual);
}

export const asyncPrefixMatchFn = prefixMatchFn;

export async function* map<T, U>(
    iterable: AsyncIterableLike<T>,
    f: (element: T, index: number) => U | Promise<U>
): AsyncIterable<U> {
    let i = 0;
    for await (const element of await iterable) {
        yield await f(element, i++);
    }
}

export const asyncMap = map;

export function mapFn<T, U>(
    f: (element: T) => U | Promise<U>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<U> {
    return iterable => map(iterable, f);
}

export const asyncMapFn = mapFn;

export function filter<T, U extends T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => element is U
): AsyncIterable<U>;
export function filter<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): AsyncIterable<T>;
export async function* filter<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): AsyncIterable<T> {
    let i = 0;
    for await (const element of await iterable) {
        if (await predicate(element, i++)) {
            yield element;
        }
    }
}

export const asyncFilter = filter;

export function filterFn<T, U extends T>(
    predicate: (element: T, index: number) => element is U
): (iterable: AsyncIterableLike<T>) => AsyncIterable<U>;
export function filterFn<T>(
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T>;
export function filterFn<T>(
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => filter(iterable, predicate);
}

export function exclude<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): AsyncIterable<T> {
    return filter(iterable, async (element, index) => !(await predicate(element, index)));
}

export const asyncExclude = exclude;

export function excludeFn<T>(
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => exclude(iterable, predicate);
}

export const asyncExcludeFn = exclude;

export function excludeNull<T>(
    iterable: AsyncIterableLike<T | null | undefined>
): AsyncIterable<T> {
    return filter(iterable, isNotNull);
}

export const asyncExcludeNull = excludeNull;

export async function* excludeFirst<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): AsyncIterable<T> {
    const iterator = asyncIterator(iterable);
    let result = await iterator.next();

    for (let i = 0; result.done !== true; ++i) {
        if (await predicate(result.value, i)) {
            break;
        }
        yield result.value;
        result = await iterator.next();
    }

    if (result.done !== true) {
        result = await iterator.next();
    }

    while (result.done !== true) {
        yield result.value;
        result = await iterator.next();
    }
}

export const asyncExcludeFirst = excludeFirst;

export function excludeFirstFn<T>(
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => excludeFirst(iterable, predicate);
}

export const asyncExcludeFirstFn = excludeFirstFn;

export function remove<T>(iterable: AsyncIterableLike<T>, value: T): AsyncIterable<T> {
    return exclude(iterable, element => element === value);
}

export const asyncRemove = remove;

export function removeFn<T>(value: T): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => remove(iterable, value);
}

export const asyncRemoveFn = removeFn;
