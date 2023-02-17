<script setup lang="ts">
import { ElMessage, ElTableColumn, ElLink } from 'element-plus';
import MessengerList from './MessengerList.vue';
import PopConfirm from './PopConfirm.vue';

defineExpose({
  reload: () => messengerList.value.reload()
})
const emits = defineEmits<{
  (e: 'edit', v: Messenger): void
}>()
const fetcher = () => $fetch('/api/get-temp-messengers')
const messengerList = ref()
const deleteState = useAsync(async (messenger: Messenger) => {
  await $fetch(`/api/delete-temp-messenger`, {
    method: 'DELETE',
    body: messenger
  })
  ElMessage.success('Temporary messenger deleted!')
  messengerList.value.reload() 
}, null, { immediate: false })
</script>

<template>
  <MessengerList ref="messengerList" :fetcher="fetcher">
    <ElTableColumn width="100" #default="{row}: {row: Messenger}">
      <div text-right whitespace-nowrap>
        <ElLink @click="emits('edit', row)" type="primary">Edit</ElLink>
        <PopConfirm
          :on-confirm="() => deleteState.execute(row)"
          :title="`Delete '${row.id}' ?`">
          <ElLink type="danger" ml-10>Delete</ElLink>
        </PopConfirm>
      </div>
    </ElTableColumn>
  </MessengerList>
</template>
