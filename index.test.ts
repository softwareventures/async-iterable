import test from "ava";
import {
    asyncIterable,
    empty,
    initial,
    last,
    notEmpty,
    only,
    push,
    tail,
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
