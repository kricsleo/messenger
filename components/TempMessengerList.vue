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

const messengerList = ref()

async function deleteTempMessenger(messenger: Messenger) {
  await myFetch(`/api/delete-temp-messenger`, {
    method: 'DELETE',
    body: messenger
  })
  ElMessage.success('Temporary messenger deleted!')
  messengerList.value.reload()
}
</script>

<template>
  <section border rounded-4>
    <h2 border-b p-10 text="bold 20 rose" flex justify-between> 
      Messengers for test only (Got lost when server restarted)
    </h2>
    <MessengerList ref="messengerList" :fetcher="() => myFetch('/api/get-temp-messengers')">
      <ElTableColumn width="100">
        <template #default="scope">
          <div text-right whitespace-nowrap>
            <ElLink @click="emits('edit', scope.row)" type="primary">Edit</ElLink>
            <PopConfirm
              :on-confirm="() => deleteTempMessenger(scope.row)"
              :title="`Delete '${scope.row.id}' ?`">
              <ElLink type="danger" ml-10>Delete</ElLink>
            </PopConfirm>
          </div>
        </template>
      </ElTableColumn>
    </MessengerList>
  </section>
</template>
