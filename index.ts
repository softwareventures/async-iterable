import type {Comparator} from "@softwareventures/ordered";
import {compare as defaultCompare, equal as defaultEqual, reverse} from "@softwareventures/ordered";
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

export function removeFirst<T>(iterable: AsyncIterableLike<T>, value: T): AsyncIterable<T> {
    return excludeFirst(iterable, element => element === value);
}

export const asyncRemoveFirst = removeFirst;

export function removeFirstFn<T>(value: T): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => removeFirst(iterable, value);
}

export const asyncRemoveFirstFn = removeFirstFn;

export async function fold<T, U>(
    iterable: AsyncIterableLike<T>,
    f: (accumulator: U, element: T, index: number) => U | Promise<U>,
    initial: U
): Promise<U> {
    let accumulator = initial;
    let i = 0;
    for await (const element of await iterable) {
        accumulator = await f(accumulator, element, i++);
    }
    return accumulator;
}

export const asyncFold = fold;

export function foldFn<T, U>(
    f: (accumulator: U, element: T, index: number) => U | Promise<U>,
    initial: U
): (iterable: AsyncIterableLike<T>) => Promise<U> {
    return async iterable => fold(iterable, f, initial);
}

export const asyncFoldFn = foldFn;

export async function fold1<T>(
    iterable: AsyncIterableLike<T>,
    f: (accumulator: T, element: T, index: number) => T | Promise<T>
): Promise<T> {
    const iterator = asyncIterator(iterable);
    let result = await iterator.next();

    if (result.done === true) {
        throw new TypeError("fold1: empty AsyncIterable");
    }

    let accumulator = result.value;
    let i = 1;
    result = await iterator.next();
    while (result.done !== true) {
        accumulator = await f(accumulator, result.value, i++);
        result = await iterator.next();
    }

    return accumulator;
}

export const asyncFold1 = fold1;

export function fold1Fn<T>(
    f: (accumulator: T, element: T, index: number) => T | Promise<T>
): (iterable: AsyncIterableLike<T>) => Promise<T> {
    return async iterable => fold1(iterable, f);
}

export const asyncFold1Fn = fold1Fn;

export async function index<T>(iterable: AsyncIterableLike<T>, index: number): Promise<T | null> {
    if (index < 0 || !isFinite(index) || Math.floor(index) !== index) {
        throw new RangeError("illegal index");
    }

    let i = 0;
    for await (const element of await iterable) {
        if (i++ === index) {
            return element;
        }
    }
    return null;
}

export const asyncIndex = index;

export function indexFn<T>(index: number): (iterable: AsyncIterableLike<T>) => Promise<T | null> {
    return async iterable => asyncIndex(iterable, index);
}

export const asyncIndexFn = indexFn;

export async function contains<T>(iterable: AsyncIterableLike<T>, value: T): Promise<boolean> {
    for await (const element of await iterable) {
        if (element === value) {
            return true;
        }
    }
    return false;
}

export const asyncContains = contains;

export function containsFn<T>(value: T): (iterable: AsyncIterableLike<T>) => Promise<boolean> {
    return async iterable => contains(iterable, value);
}

export const asyncContainsFn = containsFn;

export async function indexOf<T>(iterable: AsyncIterableLike<T>, value: T): Promise<number | null> {
    let i = 0;
    for await (const element of await iterable) {
        if (element === value) {
            return i;
        }
        ++i;
    }
    return null;
}

export const asyncIndexOf = indexOf;

export function indexOfFn<T>(value: T): (iterable: AsyncIterableLike<T>) => Promise<number | null> {
    return async iterable => indexOf(iterable, value);
}

export const asyncIndexOfFn = indexOfFn;

export async function findIndex<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): Promise<number | null> {
    let i = 0;
    for await (const element of await iterable) {
        if (await predicate(element, i)) {
            return i;
        }
        ++i;
    }
    return null;
}

export const asyncFindIndex = findIndex;

export function findIndexFn<T>(
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): (iterable: AsyncIterableLike<T>) => Promise<number | null> {
    return async iterable => findIndex(iterable, predicate);
}

export const asyncFindIndexFn = findIndexFn;

export async function find<T, U extends T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => element is U
): Promise<U | null>;
export async function find<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): Promise<T | null>;
export async function find<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): Promise<T | null> {
    let i = 0;
    for await (const element of await iterable) {
        if (await predicate(element, i++)) {
            return element;
        }
    }
    return null;
}

export const asyncFind = find;

export function findFn<T, U extends T>(
    predicate: (element: T, index: number) => element is U
): (iterable: AsyncIterableLike<T>) => Promise<U | null>;
export function findFn<T>(
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): (iterable: AsyncIterableLike<T>) => Promise<T | null>;
export function findFn<T>(
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): (iterable: AsyncIterableLike<T>) => Promise<T | null> {
    return async iterable => find(iterable, predicate);
}

export const asyncFindFn = findFn;

export async function maximum<T extends string | number | boolean>(
    iterable: AsyncIterableLike<T>
): Promise<T | null>;
export async function maximum<T>(
    iterable: AsyncIterableLike<T>,
    compare: Comparator<T>
): Promise<T | null>;
export async function maximum<T>(
    iterable: AsyncIterableLike<T>,
    compare?: Comparator<T>
): Promise<T | null> {
    return internalMaximum(iterable, compare ?? (defaultCompare as unknown as Comparator<T>));
}

export const asyncMaximum = maximum;

export function maximumFn<T>(
    compare: Comparator<T>
): (iterable: AsyncIterableLike<T>) => Promise<T | null> {
    return async iterable => maximum(iterable, compare);
}

async function internalMaximum<T>(
    iterable: AsyncIterableLike<T>,
    compare: Comparator<T>
): Promise<T | null> {
    const iterator = asyncIterator(iterable);
    let result = await iterator.next();

    if (result.done === true) {
        return null;
    }

    let max = result.value;
    result = await iterator.next();
    while (result.done !== true) {
        if (compare(result.value, max) > 0) {
            max = result.value;
        }
        result = await iterator.next();
    }

    return max;
}

export async function maximumBy<T>(
    iterable: AsyncIterableLike<T>,
    select: (element: T, index: number) => number | Promise<number>
): Promise<T | null> {
    const iterator = asyncIterator(iterable);
    let result = await iterator.next();

    if (result.done === true) {
        return null;
    }

    let max = result.value;
    let maxBy = await select(result.value, 0);
    let i = 0;

    result = await iterator.next();
    while (result.done !== true) {
        const by = await select(result.value, i++);
        if (by > maxBy) {
            max = result.value;
            maxBy = by;
        }
        result = await iterator.next();
    }

    return max;
}

export const asyncMaximumBy = maximumBy;

export function maximumByFn<T>(
    select: (element: T, index: number) => number | Promise<number>
): (iterable: AsyncIterableLike<T>) => Promise<T | null> {
    return async iterable => maximumBy(iterable, select);
}

export const asyncMaximumByFn = maximumByFn;

export async function minimum<T extends string | number | boolean>(
    iterable: AsyncIterableLike<T>
): Promise<T | null>;
export async function minimum<T>(
    iterable: AsyncIterableLike<T>,
    compare: Comparator<T>
): Promise<T | null>;
export async function minimum<T>(
    iterable: AsyncIterableLike<T>,
    compare?: Comparator<T>
): Promise<T | null> {
    return internalMaximum(
        iterable,
        reverse(compare ?? (defaultCompare as unknown as Comparator<T>))
    );
}

export const asyncMinimum = minimum;

export function minimumFn<T>(
    compare: Comparator<T>
): (iterable: AsyncIterableLike<T>) => Promise<T | null> {
    return async iterable => minimum(iterable, compare);
}

export const asyncMinimumFn = minimumFn;

export async function minimumBy<T>(
    iterable: AsyncIterableLike<T>,
    select: (element: T, index: number) => number | Promise<number>
): Promise<T | null> {
    return maximumBy(iterable, async (element, index) => -(await select(element, index)));
}

export const asyncMinimumBy = minimumBy;

export function minimumByFn<T>(
    select: (element: T, index: number) => number | Promise<number>
): (iterable: AsyncIterableLike<T>) => Promise<T | null> {
    return async iterable => minimumBy(iterable, select);
}

export const asyncMinimumByFn = minimumByFn;

export async function sum(iterable: AsyncIterableLike<number>): Promise<number> {
    return fold(iterable, (sum, element) => sum + element, 0);
}

export const asyncSum = sum;

export async function product(iterable: AsyncIterableLike<number>): Promise<number> {
    return fold(iterable, (product, element) => product * element, 1);
}

export const asyncProduct = product;

export async function average(iterable: AsyncIterableLike<number>): Promise<number | null> {
    const [sum, count] = await fold(
        iterable,
        ([sum], element, index) => [sum + element, index + 1],
        [0, 0]
    );
    return count === 0 ? null : sum / count;
}

export const asyncAverage = average;

export async function and(iterable: AsyncIterableLike<boolean>): Promise<boolean> {
    return (await findIndex(iterable, element => !element)) == null;
}

export const asyncAnd = and;

export async function or(iterable: AsyncIterableLike<boolean>): Promise<boolean> {
    return (await findIndex(iterable, Boolean)) != null;
}

export const asyncOr = or;

export async function any<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): Promise<boolean> {
    return (await findIndex(iterable, predicate)) != null;
}

export const asyncAny = any;

export async function all<T>(
    iterable: AsyncIterableLike<T>,
    predicate: (element: T, index: number) => boolean | Promise<boolean>
): Promise<boolean> {
    return (
        (await findIndex(iterable, async (element, index) => !(await predicate(element, index)))) ==
        null
    );
}

export const asyncAll = all;

export async function* concat<T>(
    iterables: AsyncIterableLike<AsyncIterableLike<T>>
): AsyncIterable<T> {
    for await (const iterable of await iterables) {
        for await (const element of iterable) {
            yield element;
        }
    }
}

export const asyncConcat = concat;

export function prepend<T>(a: AsyncIterableLike<T>): (b: AsyncIterableLike<T>) => AsyncIterable<T> {
    return b => concat([a, b]);
}

export const asyncPrepend = prepend;

export function append<T>(b: AsyncIterableLike<T>): (a: AsyncIterableLike<T>) => AsyncIterable<T> {
    return a => concat([a, b]);
}

export const asyncAppend = append;

export function concatMap<T, U>(
    iterable: AsyncIterableLike<T>,
    f: (element: T, index: number) => AsyncIterableLike<U>
): AsyncIterable<U> {
    return concat(map(iterable, f));
}

export const asyncConcatMap = concatMap;

export function concatMapFn<T, U>(
    f: (element: T, index: number) => AsyncIterableLike<U>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<U> {
    return iterable => concatMap(iterable, f);
}

export const asyncConcatMapFn = concatMapFn;

export async function noneNull<T>(
    iterable: AsyncIterableLike<T | null | undefined>
): Promise<T[] | null> {
    const result: T[] = [];

    for await (const element of await iterable) {
        if (element == null) {
            return null;
        }
        result.push(element);
    }

    return result;
}

export async function* scan<T, U>(
    iterable: AsyncIterableLike<T>,
    f: (accumulator: U, element: T, index: number) => U | Promise<U>,
    initial: U
): AsyncIterable<U> {
    let i = 0;
    let accumulator = initial;
    for await (const element of await iterable) {
        yield (accumulator = await f(accumulator, element, i++));
    }
}

export const asyncScan = scan;

export function scanFn<T, U>(
    f: (accumulator: U, element: T, index: number) => U | Promise<U>,
    initial: U
): (iterable: AsyncIterableLike<T>) => AsyncIterable<U> {
    return iterable => scan(iterable, f, initial);
}

export const asyncScanFn = scanFn;

export async function* scan1<T>(
    iterable: AsyncIterableLike<T>,
    f: (accumulator: T, element: T, index: number) => T | Promise<T>
): AsyncIterable<T> {
    const iterator = asyncIterator(iterable);
    let result = await iterator.next();

    if (result.done === true) {
        return;
    }

    let accumulator = result.value;
    yield accumulator;
    let i = 1;
    result = await iterator.next();
    while (result.done !== true) {
        yield (accumulator = await f(accumulator, result.value, i++));
        result = await iterator.next();
    }
}

export const asyncScan1 = scan1;

export function scan1Fn<T>(
    f: (accumulator: T, element: T, index: number) => T | Promise<T>
): (iterable: AsyncIterableLike<T>) => AsyncIterable<T> {
    return iterable => scan1(iterable, f);
}
