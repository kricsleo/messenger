import { describe, expect, it, test } from 'vitest'
import { transpile } from 'typescript'
import fs from 'fs/promises'
import path from 'path'
import { checkMessengerCode, isFileExists } from '../utils/utils'


const messenger = {
  id: 'kricsleo',
  code: `
    a = 4;
    export default function (b: number) {
     return a + b
    }
  `,
  target: 'unknown'
}

test('utils', () => {
  // todo: should be invalid
  expect(checkMessengerCode(messenger.code)).toMatchInlineSnapshot(`
    "\\"use strict\\";
    Object.defineProperty(exports, \\"__esModule\\", { value: true });
    a = 4;
    function default_1(b) {
        return a + b;
    }
    exports.default = default_1;
    "
  `)
})
