import { createStorage } from 'unstorage'
import { exchanger2Runtime } from '~~/utils/utils'

// runtime messenger cache
class RuntimeCache {
  cache: Map<string, RuntimeMessenger>
  constructor() {
    this.cache = new Map()
  }
  getItem(id: string) {
    return this.cache.get(id) ?? null
  }
  setItem(id: string, runtime: RuntimeMessenger) {
    return this.cache.set(id, runtime)
  }
  removeItem(id: string) {
    return this.cache.delete(id)
  }
  hasItem(id: string) {
    return this.cache.has(id)
  }
  getKeys() {
    return this.cache.keys()
  }
}
export const runtimeStorage = new RuntimeCache()

// messenger persistent storage
const messengerStorage = createStorage()

export async function getMessenger(id: string) {
  const messager: Messenger | null = await messengerStorage.getItem(id) as any
  return messager
}

export async function getAllMessengers() {
  const keys = await messengerStorage.getKeys()
  const messengers = await Promise.all(keys.map(key => messengerStorage.getItem(key)))
  return messengers
}

export async function removeMessenger(id: string) {
  return await messengerStorage.removeItem(id)
}

export async function saveMessenger(messenger: Messenger) {
  await messengerStorage.setItem(messenger.id, messenger)
  if(runtimeStorage.hasItem(messenger.id)) {
    runtimeStorage.removeItem(messenger.id)
  }
}

export async function getRuntimeMessenger(id: string): Promise<RuntimeMessenger | null> {
  if(runtimeStorage.hasItem(id)) {
    const runtimeMessenger = runtimeStorage.getItem(id) as RuntimeMessenger
    return runtimeMessenger
  } else if(await messengerStorage.hasItem(id)) {
    const messenger = await messengerStorage.getItem(id) as Messenger
    const runtimeMessenger = await setRuntime(messenger)
    return runtimeMessenger
  }
  return null
}

export async function setRuntimeMessenger(messenger: Messenger): Promise<RuntimeMessenger> {
  const runtime = await exchanger2Runtime(messenger.transpiledExchanger)
  const runtimeMessenger = { 
    ...messenger,
    runtime,
  }
  runtimeStorage.setItem(messenger.id, runtimeMessenger)
  return runtimeMessenger
}

export async function removeRuntimeMessenger(id: string) {
  if(runtimeStorage.hasItem(id)) {
    return runtimeStorage.removeItem(id)
  }
}
