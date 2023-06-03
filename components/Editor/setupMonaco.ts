import 'monaco-editor/esm/vs/editor/editor.all'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { initialize as initializeMonacoService } from 'vscode/services'
import { registerExtension, initialize as initializeVscodeExtensions, } from 'vscode/extensions'
import getTextmateServiceOverride from 'vscode/service-override/textmate'
import getThemeServiceOverride from 'vscode/service-override/theme'
import getLanguagesServiceOverride from 'vscode/service-override/languages'
// Register `json` grammer and language feature
import 'vscode/default-extensions/json'
// @ts-expect-error no types
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
// @ts-expect-error no types
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
// @ts-expect-error no types
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import { themes } from './themes/themes'

self.MonacoEnvironment = {
  getWorker: async function (moduleId, label) {
    switch (label) {
      case 'typescript': return new tsWorker()
      case 'json': return new jsonWorker()
      case 'editorWorkerService': return new editorWorker()
      default: throw new Error(`Unimplemented worker \`${label}\` (${moduleId})`)
    }
  },
}

const extraLib = `
/** Description information for messenger */
declare type Meta = {
  author?: string
  description?: string
}

/** Generate the signature of HoYowave */
declare function genHoYowaveSign(secret: string): { sign: string; timestamp: string }
`.trim()

initializeMonacoService({
  ...getTextmateServiceOverride(),
  ...getThemeServiceOverride(),
  ...getLanguagesServiceOverride(),
}).then(async () => {
  await initializeVscodeExtensions()
  await initializeContribution(),
  registerThemeExtension()
  registerGrammerExtension()
  monaco.editor.setTheme(isDark.value ? 'dark' : 'light')
  monaco.languages.typescript.typescriptDefaults.addExtraLib(extraLib, 'global.d.ts')
})

async function initializeContribution() {
  await Promise.all([
    import('monaco-editor/esm/vs/language/typescript/monaco.contribution'),
    import('monaco-editor/esm/vs/language/json/monaco.contribution'),
  ])
}

function registerThemeExtension() {
  const themeExtension = {
    name: 'themes',
    publisher: 'kricsleo',
    version: '0.0.0',
    engines: { vscode: '*', },
    contributes: { themes },
  }
  const extension = registerExtension(themeExtension)
  themes.forEach(theme => extension.registerFile(theme.path, theme.register))
}

function registerGrammerExtension() {
  const grammerExtension = {
    name: 'grammars',
    publisher: 'kricsleo',
    version: '0.0.0',
    engines: { vscode: '*', },
    contributes: {
      languages: [
        {
          "id": "typescript",
          "aliases": ["TypeScript", "ts", "typescript"],
          "extensions": [".ts", ".cts", ".mts"],
          "configuration": "./typescript.language-configuration.json"
        },
      ],
      grammars: [
        {
          language: 'typescript',
          scopeName: 'source.ts',
          path: './typescript.tmLanguage.json',
        },
      ],
    },
  }
  const grammerPaths = [
    // @ts-expect-error no types
    ['./typescript.tmLanguage.json', async () => (await import('./grammers/typescript.tmLanguage.json?raw')).default],
    // @ts-expect-error no types
    ['./typescript.language-configuration.json', async () => (await import('./grammers/typescript.language-configuration.json?raw')).default],
  ] as const
  const extension = registerExtension(grammerExtension)
  grammerPaths.forEach(([path, requirer]) => extension.registerFile(path, requirer))
}