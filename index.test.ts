import test from "ava";
import {asyncIterable, push, tail, toArray} from "./index";

test("tail", async t => {
    t.deepEqual(await toArray(tail(asyncIterable([1, 2, 3, 4]))), [2, 3, 4]);
    t.deepEqual(await toArray(tail(asyncIterable([1]))), []);
    t.deepEqual(await toArray(tail(asyncIterable([]))), []);
});

test("push", async t => {
    t.deepEqual(await toArray(push(asyncIterable([1, 2, 3]), 4)), [1, 2, 3, 4]);
    t.deepEqual(await toArray(push(asyncIterable([]), 4)), [4]);
});
