import { expect, test } from 'vitest'
import vm from 'vm'
import { transpileString } from '../server/utils/utils';

const messenger = {
  id: 'kricsleo',
  code: `
    globalThis.a = 10;
    export default function (b: number) {
     return this.a
    }
  `,
  target: 'unknown'
}

async function runtime(code: string) {
  const result = vm.runInNewContext(code)
  return result
}

test('utils', () => {
  // todo: should be invalid
  expect(transpileString(messenger.code)).toMatchInlineSnapshot(`
    "globalThis.a = 10;
    export default function (b) {
        return this.a;
    }
    "
  `)

  expect(runtime(transpileString(messenger.code))).resolves.toMatchInlineSnapshot('[Function]')

  // expect((async() => {
  //   const runtime = await trans(transpileCode(messenger.code))
  //   const obj = {
  //     runtime,
  //     a: 111
  //   }
  //   return obj.runtime(89)
  // })()).resolves.toMatchInlineSnapshot('111')
})
