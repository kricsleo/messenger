import { myNanoid, rawMessenger2Runtime, loadExistedMessenger } from '~~/utils/utils'
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
    return [...this.cache.values()]
  }
}

/** memory messengers cache */
export const messengerCache = new MessengerCache()
loadExistedMessenger()

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
