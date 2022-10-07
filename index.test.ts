import test from "ava";
import {asyncIterable, initial, last, push, tail, toArray, unshift} from "./index";

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
