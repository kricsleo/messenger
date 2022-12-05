/** export messenger meta info */
interface Meta {
  /** description of messenger */
  description?: string
  /** target href of messenger */
  target: string | string[]
}
export const meta: Meta = {
  description: 'Bonjour!',
  target: ''
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
