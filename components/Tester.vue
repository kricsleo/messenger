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
      target: target.value,
    }
  })
  ElMessage.success('Tester triggered')
}
</script>

<template>
  <section border rounded-4>
    <h2 border-b p-10 text="bold 20" flex justify-between>
      Tester
      <Button type="primary" plain :onClick="triggerTest">Run Test</Button>
    </h2>
    <div p-20 flex items-center>
      <span mr-30>Target:</span>
      <ElInput v-model="target" clearable placeholder="please input target href" />
    </div>
    <div grid="~ cols-2" overflow-hidden text-16>
      <div overflow-auto>
        <div pb-20 pl-20> 
          Test Data
          <span class="text-gray">(JSON format): </span>
        </div>
        <Editor 
          v-model="testData"
          placeholder="Mock json data goes here..."
          :style="{height: '400px'}"
          border-r
        />
      </div>
      <div overflow-auto>
        <div pb-20> Reply: </div>
        <Editor 
          :model-value="JSON.stringify(messageReply, null, 2)"
          placeholder="Test data replied"
          disabled
          :style="{height: '400px'}"
        />
      </div>
    </div>
  </section>
</template>
