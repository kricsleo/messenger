<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';
import { ElInput, ElMessage } from 'element-plus';
import Button from './Button.vue';
import Editor from './Editor.vue';

const props = defineProps<{
  raw: string
}>()

const target = useLocalStorage('testTarget', '')
const testData = useLocalStorage('testData', `{}`)
const messageReply = ref()

async function triggerTest() {
  let message
  try {
    message = JSON.parse(testData.value)
  } catch(e) {
    ElMessage.error('Test data is not a valid json')
    return
  }
  messageReply.value = await myFetch(`/api/test-messenger`, {
    method: 'POST',
    body: {
      raw: props.raw,
      message,
      target,
    }
  })
  ElMessage.success('Test triggered')
}
</script>

<template>
  <section border rounded-4>
    <h2 border-b p-10 text="bold 20" flex justify-between>
      Playground
      <Button type="primary" plain :onClick="triggerTest">Run Test</Button>
    </h2>
    <div p-20 pb-0 flex items-center>
      <span mr-20>Target:</span>
      <ElInput v-model="target" clearable placeholder="please input target href" />
    </div>
    <div flex justify-between px20 pb-20>
      <div :style="{width: '49%'}" shrink-0>
        <div text-16 py10> 
          Test Data: 
          <span class="text-gray">(JSON format)</span>
        </div>
        <Editor 
          v-model="testData"
          placeholder="Test data goes here..."
          :style="{height: '400px'}"
          text-16
        />
      </div>
      <div :style="{width: '49%'}" shrink-0>
        <div text-16 py10> Reply: </div>
        <Editor 
          :model-value="JSON.stringify(messageReply, null, 2)"
          placeholder="Test data replyed here"
          disabled
          :style="{height: '400px'}"
          text-16
        />
      </div>
    </div>
  </section>
</template>
