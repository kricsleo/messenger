<script setup lang="ts">
import { useBrowserLocation } from '@vueuse/core';
import { ElTableColumn, ElLoading, ElTable } from 'element-plus';
import CopyBtn from './CopyBtn.vue';
import Editor from './Editor.vue';

const app = useNuxtApp()
app.vueApp.use(ElLoading)

const props = defineProps<{
  fetcher: () => Promise<{messengers: Messenger[]}>
}>()
defineExpose({
  reload: () => state.execute()
})

const state = useAsync(props.fetcher, null, { immediate: true})
const location = useBrowserLocation()
</script>

<template>
  <ElTable v-loading="state.loading" :data="state.data?.messengers" class="table" :show-header="false" empty-text="No messengers">
    <ElTableColumn type="expand">
      <template #default="{ row }: {row: Messenger}">
        <Editor :modelValue="row.raw" disabled copyable />
      </template>
    </ElTableColumn>
    <ElTableColumn label="address" width="500px">
      <template #default="{row}: {row: Messenger}">
        <div flex items-center>
          {{`${location.origin}/api/messenger/${row.id}`}}
          <CopyBtn :modelValue="`${location.origin}/api/messenger/${row.id}`" tip="Copy address" />
        </div>
      </template>
    </ElTableColumn>
    <ElTableColumn label="description" show-overflow-tooltip :formatter="(row: Messenger) => row.meta?.description || '-'" />
    <slot />
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
