<script setup lang="ts">
import { ElTable, ElTableColumn } from 'element-plus'
import { formatDistanceToNowStrict, format as formatTime } from 'date-fns'
import Editor from './Editor.vue';
import Panel from './Panel.vue'

defineExpose({
  show: (id: string) => {
    messengerId.value = id
    opened.value = true
  }
})

const opened = ref(false)
const messengerId = ref('')
const messageListState = useAsync(() => $fetch('/api/get-messages', { query: { id: messengerId.value }}), null, { immediate: false })
const messageList = computed(() => (messageListState.data?.messages || []).map(message => ({
  ...message,
  message: JSON.stringify(JSON.parse(message.message), null, 2)
})))

watch([opened, messengerId], () => {
  if(opened.value && messengerId.value) {
    messageListState.execute()
  }
})
</script>

<template>
  <Panel v-model="opened" :title="`Recent messages of '${ messengerId }'`">
    <template #header>
      <button @click="messageListState.execute" ml-10 expand-click active:rotate-360 duration-150>
        <div i-carbon:renew />
      </button>
    </template>
    <ElTable 
      v-loading="messageListState.loading" 
      :data="messageList" 
      :show-header="false" 
      empty-text="No messages"
      row-key="id">
      <ElTableColumn type="expand" #default="{ row }: {row: CachedMessage}">
        <Editor :modelValue="row.message" :style="{maxHeight: '400px'}" disabled copyable />
      </ElTableColumn>
      <ElTableColumn width="280" #default="{row}: {row: CachedMessage}">
        <span>{{ formatDistanceToNowStrict(row.timestamp) }} ago</span>
        <span text-12>&nbsp;({{ formatTime(row.timestamp, 'yyyy-MM-dd HH:mm:ss') }})</span>
      </ElTableColumn>
      <ElTableColumn #default="{row}: {row: CachedMessage}">
        <div y-center justify-end gap-5>
          <div i-carbon:send-alt shrink-0 />
          {{ row.target }}
        </div>
      </ElTableColumn>
    </ElTable>
  </Panel>
</template>
