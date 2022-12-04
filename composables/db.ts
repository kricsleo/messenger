import { myNanoid, rawMessenger2Runtime } from '~~/utils/utils'
import fs from 'fs/promises'

class MessengerCache {
  private cache: Map<string, Messenger>
  constructor() {
    this.cache = new Map()
  }
  getMessenger(id: string) {
    return this.cache.get(id) ?? null
  }
  setMessenger(id: string, messenger: Messenger) {
    console.log('settin', id);
    return this.cache.set(id, messenger)
  }
  removeMessenger(id: string) {
    return this.cache.delete(id)
  }
  getAllMessengers() {
    console.log('getting',);
    return [...this.cache.values()]
  }
}

/** memory messengers cache */
export const messengerCache = new MessengerCache()

export async function getActiveMessenger(id: string): Promise<Messenger | null> {
  const messenger = messengerCache.getMessenger(id)
  if(!messenger) {
    return null
  }
  if(messenger.active) {
    return messenger
  }
  // You can freeze this runtime when it's not used after a period to reclaim memory.
  // I only do this when the memory is too small.
  const runtime = await rawMessenger2Runtime(messenger.raw)
  const activeMessenger = {...messenger, ...runtime}
  messengerCache.setMessenger(id, activeMessenger)
  return activeMessenger
}

export function createMessengerId(): string {
  const id = myNanoid()
  // if this id already existed, loop to find an avaliable one
  if(!messengerCache.getMessenger(id)) {
    return id
  } else {
    return createMessengerId()
  }
}

export async function loadExistedMessenger() {
  const imports = import.meta.glob('./messengers/*.ts')
  const messengers = await Promise.all<Messenger>(Object.entries(imports).map(async ([filename, im]) => {
    const id = filename.split('/').pop()!.slice(0, -3)
    const raw = await im() as unknown as string
    console.log('raw', raw);
    const { transpiled, meta, runtime } = await rawMessenger2Runtime(raw)
    return { id, raw, transpiled, meta, runtime }
  }))
  messengers.forEach(messenger => {
    messengerCache.setMessenger(messenger.id, messenger)
  });
  return messengers
}
