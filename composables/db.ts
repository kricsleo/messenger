import path from 'path'
// todo: db
import { createStorage } from 'unstorage'
import { RUNTIME_CACHE_DIR } from '~~/constants/constants'
import { isFileExists } from '~~/utils/utils'
import fs from 'fs/promises'

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

export async function getRuntime(id: string) {
  if(await runtimeStorage.hasItem(id)) {
    return runtimeStorage.getItem(id)
  }
}

export async function setRuntime(messenger: Messenger) {
  const dir = path.resolve(process.cwd(), RUNTIME_CACHE_DIR)
  const filepath = `${dir}/${messenger.id}.ts`
  if(!isFileExists(dir)) {
    await fs.mkdir(dir)
  }
  await fs.writeFile(filepath, messenger.code)
  const module = await import(filepath)
  const runtimeMessenger = { 
    ...messenger,
    run: module.default,
  }
  runtimeStorage.setItem(messenger.id, runtimeMessenger)
  return runtimeMessenger
}
