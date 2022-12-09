<script setup lang="ts">
import { useBrowserLocation } from '@vueuse/core';
import { ElTableColumn, ElLoading, ElTable } from 'element-plus';
import CopyBtn from './CopyBtn.vue';
import Editor from './Editor.vue';

const app = useNuxtApp()
app.vueApp.use(ElLoading)

defineExpose({
  reload: () => state.execute()
})
const state = useAsync(async () => {
  const result = await myFetch(`/api/get-all-messengers`)
  return result.messengers
})
const location = useBrowserLocation()
</script>

<template>
  <ElTable v-loading="state.loading" :data="state.data || []" class="table">
    <ElTableColumn type="expand">
      <template #default="{ row }: {row: Messenger}">
        <Editor :modelValue="row.raw" disabled copyable />
      </template>
    </ElTableColumn>
    <ElTableColumn label="address">
      <template #default="{row}: {row: Messenger}">
        <div flex items-center>
          {{`${location.origin}/api/messenger/${row.id}`}}
          <CopyBtn :modelValue="`${location.origin}/api/messenger/${row.id}`" tip="Copy address" />
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn label="description" width="400px" show-overflow-tooltip :formatter="(row: Messenger) => row.meta?.description || '-'" />
  </ElTable>
</template>

<style scoped>
.table:deep(.el-table__expanded-cell) {
  padding: 0;
}
.table:deep(.el-table__inner-wrapper::before) {
  background-color: rgba(229, 231, 235, 0.5);
}
</style>
