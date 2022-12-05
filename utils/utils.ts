import { ElMessage } from 'element-plus'

/**
 * 封装异步状态
 * (@vue/core 提供的 useAsyncState 存在异步竞态的问题)
 */
 interface UseAsyncOptions {
  /** @default true */
  shallow?: boolean;
  /** @default true */
  reset?: boolean;
  /** @default true */
  immediate?: boolean;
}
interface UseAsyncReturn<Data, MaybeUndef = false> {
  data: MaybeUndef extends false ? Data : Data | undefined
  ready: boolean
  loading: boolean
  error: undefined | Error
  execute: (...args: any) => Promise<Data>
}
export function useAsync<Data>(
  fn: (...args: any) => Promise<Data> | Data
): UseAsyncReturn<Data, true>
export function useAsync<Data>(
  fn: (...args: any) => Promise<Data> | Data,
  initialData: Data,
  options?: UseAsyncOptions
): UseAsyncReturn<Data>
export function useAsync<Data>(
  fn: (...args: any) => Promise<Data> | Data,
  initialData?: Data,
  options?: UseAsyncOptions,
) {
  const { shallow = true, reset = true, immediate = true } = options || {};
  const data = shallow ? shallowRef(initialData) : ref(initialData);
  const state = reactive({
    data,
    ready: false,
    loading: false,
    error: undefined as unknown | undefined,
    execute,
  })
  let __racingId
  immediate && execute()
  return state

  async function execute(...args: any) {
    reset && (data.value = initialData);
    state.error = undefined
    state.ready = false
    state.loading = true
    __racingId = performance.now();
    const executeRacingId = __racingId;
    try {
      const result = await fn(...args);
      // prevent async reacing
      if (executeRacingId !== __racingId) {
        return data.value;
      }
      data.value = result;
      state.ready = true;
    } catch (e) {
      // prevent async reacing
      if (executeRacingId !== __racingId) {
        return data.value;
      }
      state.error = e;
    }
    state.loading = false;
    return data.value;
  }
}

export const myFetch = $fetch.create({
  onRequestError({ error }) {
    ElMessage.error(error.message) 
  },
  async onResponse({ response }) {
    const data = response._data
    if(data?.c !== 0) {
      ElMessage.error(data?.m || 'Unknown error')  
      return Promise.reject(response)
    }
    response._data = data.d
  },
  onResponseError({ error }) {
    ElMessage.error(error?.message || 'Unknown error')
  },
})

