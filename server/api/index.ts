import { name, version } from '../../package.json'
export default eventHandler(() => {
  return {
    name,
    version
  }
})
