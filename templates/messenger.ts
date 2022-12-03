interface Meta {
  description?: string
  address: string | string[]
}
export const META: Meta = {
  description: 'Bonjour!',
  address: ''
}

interface Message {

}
interface Delivered {

}
export default function transformer(message: Message): Delivered {
  return {
    
  }
}
