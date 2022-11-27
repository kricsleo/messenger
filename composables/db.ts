import path from 'path'
// todo: db
import { createStorage } from 'unstorage'
import { RUNTIME_CACHE_DIR } from '~~/constants/constants'
import { isFileExists } from '~~/utils/utils'
import fs from 'fs/promises'
import ts from 'typescript'

// messenger persistent storage
const messengerStorage = createStorage()

export async function getMessenger(id: string) {
  const messager: Messenger | null = await messengerStorage.getItem(id) as any
  return messager
}

export async function saveMessenger(messenger: Messenger) {
  return messengerStorage.setItem(messenger.id, messenger)
}

export async function hasMessenger(id: string) {
  return messengerStorage.hasItem(id)
}




// runtime messenger cache
export const runtimeStorage = createStorage()

export async function getRuntime(id: string): Promise<RuntimeMessenger | null> {
  if(await runtimeStorage.hasItem(id)) {
    const runtimeMessenger = await runtimeStorage.getItem(id) as RuntimeMessenger
    return runtimeMessenger
  } else if(await messengerStorage.hasItem(id)) {
    const messenger = await messengerStorage.getItem(id) as Messenger
    const runtimeMessenger = await setRuntime(messenger)
    return runtimeMessenger
  }
  return null
}

export async function setRuntime(messenger: Messenger): Promise<RuntimeMessenger> {
  const dir = path.resolve(process.cwd(), RUNTIME_CACHE_DIR)
  const filepath = `${dir}/${messenger.id}.js`
  if(!isFileExists(dir)) {
    await fs.mkdir(dir)
  }
  const content = ts.transpileModule(messenger.code, { compilerOptions: { module: 1 } })
  await fs.writeFile(filepath, content.outputText)
  const module = await import(filepath)
  console.log('module', module);
  
  const runtimeMessenger = { 
    ...messenger,
    run: module.default.default,
  }
  runtimeStorage.setItem(messenger.id, runtimeMessenger)
  return runtimeMessenger
}
