<script setup lang="ts">
import { useBrowserLocation } from '@vueuse/core';
import { ElTableColumn, ElTable, ElTooltip } from 'element-plus';
import CopyBtn from './CopyBtn.vue';
import Editor from './Editor.vue';
import MessageListPanel from './MessageListPanel.vue'

const props = defineProps<{
  fetcher: () => Promise<{messengers: Messenger[]} | null>
}>()
defineExpose({
  reload: () => state.execute()
})

const state = useAsync(props.fetcher, null, { immediate: true})
const location = useBrowserLocation()
const messageListPanelRef = ref<InstanceType<typeof MessageListPanel>>()
</script>

<template>
  <ElTable 
    v-loading="state.loading" 
    :data="state.data?.messengers" 
    :show-header="false" 
    empty-text="No messengers"
    row-key="id"
    tooltip-effect="light">
    <ElTableColumn type="expand" #default="{ row }: {row: Messenger}">
      <Editor :modelValue="row.raw" :style="{maxHeight: '600px'}" disabled copyable />
    </ElTableColumn>
    <ElTableColumn #default="{row}: {row: Messenger}">
      <div flex items-center whitespace-nowrap>
        {{`${location.origin}/api/messenger/${row.id}`}}
        <CopyBtn :modelValue="`${location.origin}/api/messenger/${row.id}`" tip="Copy href" />
      </div>
    </ElTableColumn>
    <ElTableColumn width="40" #default="{row}">
      <ElTooltip content="view recent messages" placement="top" effect="light" :hideAfter="0">
        <div i-carbon:data-view cursor-pointer text-20 @click="messageListPanelRef?.show(row.id)" />
      </ElTooltip>
    </ElTableColumn>
    <ElTableColumn 
      label="Description"
      width="300"
      show-overflow-tooltip
      :formatter="(row: Messenger) => row.meta?.description || '-'" />
    <slot />
  </ElTable>
  <MessageListPanel ref="messageListPanelRef" />
</template>
