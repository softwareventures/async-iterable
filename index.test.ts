import test from "ava";
import {
    all,
    and,
    any,
    append,
    asyncIterable,
    average,
    concat,
    concatMap,
    contains,
    drop,
    dropWhile,
    empty,
    equal,
    exclude,
    excludeFirst,
    excludeNull,
    filter,
    find,
    findIndex,
    fold,
    fold1,
    index,
    indexOf,
    initial,
    last,
    map,
    maximum,
    maximumBy,
    minimum,
    minimumBy,
    noneNull,
    notEmpty,
    only,
    or,
    prefixMatch,
    prepend,
    product,
    push,
    remove,
    removeFirst,
    sum,
    tail,
    take,
    takeWhile,
    toArray,
    unshift
} from "./index";

test("tail", async t => {
    t.deepEqual(await toArray(tail(asyncIterable([1, 2, 3, 4]))), [2, 3, 4]);
    t.deepEqual(await toArray(tail(asyncIterable([1]))), []);
    t.deepEqual(await toArray(tail(asyncIterable([]))), []);
});

test("push", async t => {
    t.deepEqual(await toArray(push(asyncIterable([1, 2, 3]), 4)), [1, 2, 3, 4]);
    t.deepEqual(await toArray(push(asyncIterable([]), 4)), [4]);
});

test("unshift", async t => {
    t.deepEqual(await toArray(unshift(asyncIterable([1, 2, 3]), 4)), [4, 1, 2, 3]);
    t.deepEqual(await toArray(unshift(asyncIterable([]), 4)), [4]);
});

test("initial", async t => {
    t.deepEqual(await toArray(initial(asyncIterable([1, 2, 3, 4]))), [1, 2, 3]);
    t.deepEqual(await toArray(initial(asyncIterable([1]))), []);
    t.deepEqual(await toArray(initial(asyncIterable([]))), []);
});

test("last", async t => {
    t.is(await last(asyncIterable([])), null);
    t.is(await last(asyncIterable([1, 2, 3])), 3);
});

test("only", async t => {
    t.is(await only(asyncIterable([])), null);
    t.is(await only(asyncIterable([4])), 4);
    t.is(await only(asyncIterable([3, 4, 5])), null);
});

test("empty", async t => {
    t.is(await empty(asyncIterable([])), true);
    t.is(await empty(asyncIterable([1])), false);
    t.is(await empty(asyncIterable([1, 2, 3])), false);
});

test("notEmpty", async t => {
    t.is(await notEmpty(asyncIterable([])), false);
    t.is(await notEmpty(asyncIterable([1])), true);
    t.is(await notEmpty(asyncIterable([1, 2, 3])), true);
});

test("take", async t => {
    t.deepEqual(await toArray(take(asyncIterable([]), 3)), []);
    t.deepEqual(await toArray(take(asyncIterable([1, 2]), 3)), [1, 2]);
    t.deepEqual(await toArray(take(asyncIterable([1, 2, 3, 4, 5]), 3)), [1, 2, 3]);
    t.deepEqual(await toArray(take(asyncIterable([1, 2, 3, 4, 5]), 0)), []);
});

test("drop", async t => {
    t.deepEqual(await toArray(drop(asyncIterable([]), 3)), []);
    t.deepEqual(await toArray(drop(asyncIterable([1, 2]), 3)), []);
    t.deepEqual(await toArray(drop(asyncIterable([1, 2, 3, 4, 5]), 3)), [4, 5]);
    t.deepEqual(await toArray(drop(asyncIterable([1, 2, 3, 4, 5]), 0)), [1, 2, 3, 4, 5]);
});

test("takeWhile", async t => {
    t.deepEqual(await toArray(takeWhile(asyncIterable([]), (_, i) => i < 3)), []);
    t.deepEqual(await toArray(takeWhile(asyncIterable([1, 2]), (_, i) => i < 3)), [1, 2]);
    t.deepEqual(
        await toArray(takeWhile(asyncIterable([1, 2, 3, 4, 5]), (_, i) => i < 3)),
        [1, 2, 3]
    );
    t.deepEqual(await toArray(takeWhile(asyncIterable([1, 2, 3, 4, 5]), () => false)), []);
    t.deepEqual(
        await toArray(takeWhile(asyncIterable([1, 2, 3, 4, 3, 2, 1]), e => e < 4)),
        [1, 2, 3]
    );
});

test("dropWhile", async t => {
    t.deepEqual(await toArray(dropWhile(asyncIterable([]), (_, i) => i < 3)), []);
    t.deepEqual(await toArray(dropWhile(asyncIterable([1, 2]), (_, i) => i < 3)), []);
    t.deepEqual(await toArray(dropWhile(asyncIterable([1, 2, 3, 4, 5]), (_, i) => i < 3)), [4, 5]);
    t.deepEqual(
        await toArray(dropWhile(asyncIterable([1, 2, 3, 4, 5]), () => false)),
        [1, 2, 3, 4, 5]
    );
    t.deepEqual(
        await toArray(dropWhile(asyncIterable([1, 2, 3, 4, 3, 2, 1]), e => e < 4)),
        [4, 3, 2, 1]
    );
});

test("equal", async t => {
    t.true(await equal(asyncIterable([1, 2, 3]), asyncIterable([1, 2, 3])));
    t.false(await equal(asyncIterable([1, 2, 3]), asyncIterable([1, 2, 3, 4])));
    t.false(await equal(asyncIterable([1, 2, 3, 4]), asyncIterable([1, 2, 3])));
    t.false(await equal(asyncIterable([1, 3, 3]), asyncIterable([1, 2, 3])));
    t.true(
        await equal(
            asyncIterable([asyncIterable([1, 2]), asyncIterable([3, 4])]),
            asyncIterable([asyncIterable([1, 2]), asyncIterable([3, 4])]),
            equal
        )
    );
    t.false(
        await equal(
            asyncIterable([asyncIterable([1, 2]), asyncIterable([3, 4])]),
            asyncIterable([asyncIterable([1, 2]), asyncIterable([3, 4])])
        )
    );
});

test("prefixMatch", async t => {
    t.true(await prefixMatch(asyncIterable([]), asyncIterable([])));
    t.true(await prefixMatch(asyncIterable([1, 2, 3]), asyncIterable([])));
    t.true(await prefixMatch(asyncIterable([1, 2, 3, 4]), asyncIterable([1, 2])));
    t.false(await prefixMatch(asyncIterable([1, 3, 4]), asyncIterable([1, 2])));
    t.false(await prefixMatch(asyncIterable([]), asyncIterable([1])));
});

test("map", async t => {
    t.deepEqual(await toArray(map(asyncIterable([1, 2, 3]), e => e + 1)), [2, 3, 4]);
    t.deepEqual(
        await toArray(map(asyncIterable([1, 2, 3]), (e, i) => (i === 1 ? e * 10 : e))),
        [1, 20, 3]
    );
});

test("filter", async t => {
    t.deepEqual(await toArray(filter(asyncIterable([1, 2, 3]), e => e % 2 === 1)), [1, 3]);
    t.deepEqual(
        await toArray(filter(asyncIterable([1, 3, 2, 4, 5]), (_, i) => i % 2 === 0)),
        [1, 2, 5]
    );
});

test("exclude", async t => {
    t.deepEqual(
        await toArray(exclude(asyncIterable([1, 2, 3, 4, 3, 2, 1]), n => n < 3)),
        [3, 4, 3]
    );
});

test("excludeNull", async t => {
    t.deepEqual(await toArray(excludeNull(asyncIterable(["a", null, "b"]))), ["a", "b"]);
});

test("excludeFirst", async t => {
    t.deepEqual(
        await toArray(excludeFirst(asyncIterable([1, 2, 3, 4, 3, 2, 1]), n => n > 2)),
        [1, 2, 4, 3, 2, 1]
    );
});

test("remove", async t => {
    t.deepEqual(await toArray(remove(asyncIterable([1, 2, 3, 4, 3, 2, 1]), 3)), [1, 2, 4, 2, 1]);
});

test("removeFirst", async t => {
    t.deepEqual(
        await toArray(removeFirst(asyncIterable([1, 2, 3, 4, 3, 2, 1]), 3)),
        [1, 2, 4, 3, 2, 1]
    );
});

test("fold", async t => {
    t.is(await fold(asyncIterable([1, 2, 3]), (a, e, i) => a + e * i, 0), 8);
});

test("fold1", async t => {
    t.is(await fold1(asyncIterable([1, 2, 3]), (a, e, i) => a + e * i), 9);
});

test("index", async t => {
    t.is(await index(asyncIterable([1, 2, 3, 4, 3, 2, 1]), 2), 3);
    t.is(await index(asyncIterable([1, 2, 3, 4, 3, 2, 1]), 7), null);
});

test("contains", async t => {
    t.true(await contains(asyncIterable([1, 2, 3]), 1));
    t.false(await contains(asyncIterable([1, 2, 3]), 0));
});

test("indexOf", async t => {
    t.is(await indexOf(asyncIterable([1, 2, 3, 4, 3, 2, 1]), 3), 2);
    t.is(await indexOf(asyncIterable([1, 2, 3, 4, 3, 2, 1]), 5), null);
});

test("findIndex", async t => {
    t.is(await findIndex(asyncIterable([1, 2, 3, 4, 3, 2, 1]), n => n >= 3), 2);
});

test("find", async t => {
    t.is(await find(asyncIterable([1, 2, 3, 4, 3, 2, 1]), n => n >= 3), 3);
});

test("maximum", async t => {
    t.is(await maximum(asyncIterable([1, 2, 3])), 3);
    t.is(await maximum(asyncIterable([1, 2, 3, 4, 3, 2, 1])), 4);
    t.is(await maximum(asyncIterable([])), null);
});

test("maximumBy", async t => {
    t.is(await maximumBy(asyncIterable(["1", "2", "3"]), Number), "3");
    t.is(await maximumBy(asyncIterable(["1", "2", "3", "4", "3", "2", "1"]), Number), "4");
    t.is(await maximumBy(asyncIterable([]), Number), null);
});

test("minimum", async t => {
    t.is(await minimum(asyncIterable([1, 2, 3])), 1);
    t.is(await minimum(asyncIterable([2, 3, 4, 1, 2, 3])), 1);
    t.is(await minimum(asyncIterable([])), null);
});

test("minimumBy", async t => {
    t.is(await minimumBy(asyncIterable(["1", "2", "3"]), Number), "1");
    t.is(await minimumBy(asyncIterable(["2", "3", "4", "1", "2", "3"]), Number), "1");
    t.is(await minimumBy(asyncIterable([]), Number), null);
});

test("sum", async t => {
    t.is(await sum(asyncIterable([1, 2, 3])), 6);
    t.is(await sum(asyncIterable([])), 0);
});

test("product", async t => {
    t.is(await product(asyncIterable([1, 2, 3])), 6);
    t.is(await product(asyncIterable([1, 2, 3, 2])), 12);
    t.is(await product(asyncIterable([])), 1);
});

test("average", async t => {
    t.is(await average(asyncIterable([1, 2, 3])), 2);
    t.is(await average(asyncIterable([1, 2, 3, 2])), 2);
    t.is(await average(asyncIterable([])), null);
});

test("and", async t => {
    t.true(await and(asyncIterable([true, true, true])));
    t.false(await and(asyncIterable([true, false, true])));
    t.true(await and(asyncIterable([])));
});

test("or", async t => {
    t.true(await or(asyncIterable([true, false, true])));
    t.false(await or(asyncIterable([false, false, false])));
    t.false(await or(asyncIterable([])));
});

test("any", async t => {
    t.true(await any(asyncIterable([1, 2, 3]), e => e > 2));
    t.false(await any(asyncIterable([1, 2, 3]), e => e > 4));
});

test("all", async t => {
    t.true(await all(asyncIterable([1, 2, 3]), e => e < 4));
    t.false(await all(asyncIterable([1, 2, 3]), e => e > 2));
});

test("concat", async t => {
    t.deepEqual(
        await toArray(
            concat(
                asyncIterable([
                    asyncIterable([1, 2]),
                    asyncIterable([]),
                    asyncIterable([3]),
                    asyncIterable([4, 5])
                ])
            )
        ),
        [1, 2, 3, 4, 5]
    );
    t.deepEqual(await toArray(concat(asyncIterable([asyncIterable([]), asyncIterable([])]))), []);
});

test("prepend", async t => {
    t.deepEqual(
        await toArray(prepend(asyncIterable([1, 2, 3]))(asyncIterable([4, 5, 6]))),
        [1, 2, 3, 4, 5, 6]
    );
    t.deepEqual(
        await toArray(prepend(asyncIterable<number>([]))(asyncIterable([4, 5, 6]))),
        [4, 5, 6]
    );
    t.deepEqual(await toArray(prepend(asyncIterable([1, 2, 3]))(asyncIterable([]))), [1, 2, 3]);
});

test("append", async t => {
    t.deepEqual(
        await toArray(append(asyncIterable([4, 5, 6]))(asyncIterable([1, 2, 3]))),
        [1, 2, 3, 4, 5, 6]
    );
    t.deepEqual(
        await toArray(append(asyncIterable<number>([]))(asyncIterable([1, 2, 3]))),
        [1, 2, 3]
    );
    t.deepEqual(await toArray(append(asyncIterable([4, 5, 6]))(asyncIterable([]))), [4, 5, 6]);
});

test("concatMap", async t => {
    t.deepEqual(await toArray(concatMap(asyncIterable(["1,2,3", "4,5,6"]), s => s.split(","))), [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6"
    ]);
});

test("noneNull", async t => {
    t.deepEqual(await noneNull(asyncIterable([1, 2, 3])), [1, 2, 3]);
    t.is(await noneNull(asyncIterable([1, null, 3])), null);
    t.is(await noneNull(asyncIterable([undefined, 2, 3])), null);
    t.deepEqual(await noneNull(asyncIterable([])), []);
});
