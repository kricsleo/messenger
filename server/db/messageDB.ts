import { MemoryCache, uuid, roughMemorySizeOfString } from '../utils/utils';

/** all messages received */
export const messageCache = new MemoryCache<CachedMessage[]>()
/** max memory size for each messenger: 2MB */
const maxSize = 2 * 1024 * 1024

/** save message to memory */
export function saveMessage(messengerId: string, payload: { message: unknown; target: Target}) {
  const cachedMessages = messageCache.get(messengerId)
  const messageStr = JSON.stringify(payload.message)
  const messageSize = roughMemorySizeOfString(messageStr)
  const cachedMessage = { 
    id: uuid(),
    messengerId,
    message: messageStr, 
    target: payload.target, 
    size: messageSize, 
    // todo：different timezone between server and client
    timestamp: Date.now()
  }
  // message more than [maxSize] will be skipped
  if(messageSize > maxSize) {
    return false
  }
  if(cachedMessages) {
    freeMessageCache(messengerId, messageSize)
    cachedMessages.push(cachedMessage)
  } else {
    const cache = [cachedMessage]
    messageCache.set(messengerId, cache)
  }
  return true
}

export function cleanMessage(messengerId: string) {
  messageCache.remove(messengerId)
}

/** free memory cache */
export function freeMessageCache(messengerId: string, minimalFreeSize: number) {
  const cachedMessages = messageCache.get(messengerId)
  if(!cachedMessages) {
    return
  }
  const cacheSize = cachedMessages.reduce((all, cur) => all + cur.size, 0)
  if(cacheSize + minimalFreeSize <= maxSize) {
    return
  }
  cachedMessages.shift()
  freeMessageCache(messengerId, minimalFreeSize)
}
