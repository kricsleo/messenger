import { createStorage } from 'unstorage'
import { messenger2Runtime } from '~~/utils/utils'

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

/** memory runtime storage */
const runtimeStorage = new RuntimeCache()

/** persistently messenger storage */
const messengerStorage = createStorage()

/** memory operation */
export async function getRuntimeMessenger(id: string): Promise<RuntimeMessenger | null> {
  if(runtimeStorage.hasItem(id)) {
    const runtimeMessenger = runtimeStorage.getItem(id) as RuntimeMessenger
    return runtimeMessenger
  } else if(await messengerStorage.hasItem(id)) {
    const messenger = await messengerStorage.getItem(id) as Messenger
    const runtimeMessenger = await setRuntimeMessenger(messenger)
    return runtimeMessenger
  }
  return null
}

export async function setRuntimeMessenger(messenger: Messenger): Promise<RuntimeMessenger> {
  const { transpiled, runtime } = await messenger2Runtime(messenger)
  const runtimeMessenger: RuntimeMessenger = { 
    ...messenger,
    transpiledExchanger: transpiled,
    runtime,
  }
  // You can freeze this runtime when it's not used after a period to reclaim memory.
  // I only do this when the memory is too small.
  runtimeStorage.setItem(messenger.id, runtimeMessenger)
  return runtimeMessenger
}

export async function removeRuntimeMessenger(id: string) {
  if(runtimeStorage.hasItem(id)) {
    return runtimeStorage.removeItem(id)
  }
}

/** persistent storage operation */
export async function getMessenger(id: string) {
  const messeger: Messenger | null = await messengerStorage.getItem(id) as any
  return messeger
}

export async function getAllMessengers() {
  const keys = await messengerStorage.getKeys()
  const messengers = await Promise.all(keys.map(key => messengerStorage.getItem(key)))
  return messengers
}

export async function removeMessenger(id: string) {
  removeRuntimeMessenger(id)
  await messengerStorage.removeItem(id)
}

export async function saveMessenger(messenger: Messenger) {
  await messengerStorage.setItem(messenger.id, messenger)
  if(runtimeStorage.hasItem(messenger.id)) {
    runtimeStorage.removeItem(messenger.id)
  }
}
