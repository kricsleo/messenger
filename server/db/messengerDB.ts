import { rawMessenger2Runtime, uuid, MemoryCache } from '../utils/utils'

/** memory messengers cache */
export const messengerCache = new MemoryCache<Messenger>()

export async function getActiveMessenger(id: string): Promise<Messenger | null> {
  const messenger = messengerCache.get(id)
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
  messengerCache.set(id, activeMessenger)
  return activeMessenger
}

export function createMessengerId(): string {
  const id = uuid()
  // if this id already existed, loop to find an avaliable one
  if(!messengerCache.get(id)) {
    return id
  } else {
    return createMessengerId()
  }
}

/**
 * loading file assets
 * @see [Assets Handling](https://nitro.unjs.io/guide/introduction/assets)
 */
export async function loadServerAssets(path: string) {
  const fileKeys: string[] = await useStorage().getKeys(path)
  const assets = await Promise.all(fileKeys.map(async fileKey => {
    const raw: string = await useStorage().getItem(fileKey)
    const id = fileKey.split(':').pop()!.split('.').shift()!
    return { id, raw }
  }))
  return assets
}

export async function loadExistedMessenger() {
  const messengerAssets = await loadServerAssets('assets:server:messengers')
  await Promise.all(messengerAssets.map(async asset => {
    const messenger = await rawMessenger2Runtime(asset.raw)
    messengerCache.set(asset.id, { ...messenger, id: asset.id, raw: asset.raw })
  }))
}
