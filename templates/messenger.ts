/** export messenger meta info */
interface Meta {
  /** author of messenger */
  author: string
  /** description of messenger */
  description?: string
}
export const meta: Meta = {
  author: 'kricsleo',
  description: 'Bonjour!',
}

/** export default transformer function to transform message between the trigger and the receiver */
interface Message {

}
interface Delivered {

}
export default function transformer(message: Message): Delivered {
  return {
    
  }
}
