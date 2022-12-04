import { describe, expect, it, test } from 'vitest'
import { transpile } from 'typescript'
import fs from 'fs/promises'
import path from 'path'
import { transpileCode } from '../utils/utils'
import vm from 'vm'


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

async function trans(code: string) {
  const context = vm.createContext({
    // code running context
    print: console.log,
  });

  // @ts-expect-error experimental
  const vmModule = new vm.SourceTextModule(code, { context })
  await vmModule.link((specifier: string) => {
    // forbidden using import
    throw new Error(`"import" is forbidden: you are importing "${specifier}"`)
  });
  
  await vmModule.evaluate()
  return vmModule.namespace.default
}

test('utils', () => {
  // todo: should be invalid
  expect(transpileCode(messenger.code)).toMatchInlineSnapshot(`
    "globalThis.a = 10;
    export default function (b) {
        return this.a;
    }
    "
  `)

  expect(trans(transpileCode(messenger.code))).resolves.toMatchInlineSnapshot('[Function]')

  expect((async() => {
    const runtime = await trans(transpileCode(messenger.code))
    const obj = {
      runtime,
      a: 111
    }
    return obj.runtime(89)
  })()).resolves.toMatchInlineSnapshot('111')
})
