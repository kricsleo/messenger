import { createStorage } from 'unstorage'
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
class RuntimeCache {
  cache: Map<string, RuntimeMessenger>
  constructor() {
    this.cache = new Map()
  }
  getItem(id: string) {
    return this.cache.get(id) ?? null
  }
  setItem(id: string, runtime: RuntimeMessenger) {
    this.cache.set(id, runtime)
  }
  hasItem(id: string) {
    return this.cache.has(id)
  }
  getKeys() {
    return this.cache.keys()
  }
}
export const runtimeStorage = new RuntimeCache()

export async function getRuntime(id: string): Promise<RuntimeMessenger | null> {
  if(runtimeStorage.hasItem(id)) {
    const runtimeMessenger = runtimeStorage.getItem(id) as RuntimeMessenger
    console.log('runtimeMessenger', runtimeMessenger)
    return runtimeMessenger
  } else if(await messengerStorage.hasItem(id)) {
    const messenger = await messengerStorage.getItem(id) as Messenger
    const runtimeMessenger = await setRuntime(messenger)
    return runtimeMessenger
  }
  return null
}

export async function setRuntime(messenger: Messenger): Promise<RuntimeMessenger> {
  const transpiled = ts.transpileModule(messenger.code, { 
    compilerOptions: { module: ts.ModuleKind.ESNext } }
  )
  const base64Str = `data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString('base64')}`
  const module = await import(base64Str)
  const runtimeMessenger = { 
    ...messenger,
    run: module.default,
  }
  runtimeStorage.setItem(messenger.id, runtimeMessenger)
  return runtimeMessenger
}
