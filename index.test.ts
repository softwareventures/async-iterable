import test from "ava";
import {asyncIterable, tail, toArray} from "./index";

test("tail", async t => {
    t.deepEqual(await toArray(tail(asyncIterable([1, 2, 3, 4]))), [2, 3, 4]);
    t.deepEqual(await toArray(tail(asyncIterable([1]))), []);
    t.deepEqual(await toArray(tail(asyncIterable([]))), []);
});
