<script setup lang="ts">
import { ElButton, ElMessage, ElTable, ElTableColumn, ElInput } from 'element-plus'
import { useLocalStorage } from '@vueuse/core';
import Editor from '~~/components/Editor.vue';
import { ref } from 'vue';
import { myFetch } from '~~/utils/utils';
import Button from '~~/components/Button.vue';
import MessengerList from '~~/components/MessengerList.vue'
import Playground from '~~/components/Playground.vue';
import PopConfirm from '~~/components/PopConfirm.vue';

const editorContent = ref<HTMLDivElement>()
const tempMessengerId = ref()
const messengerCode = useLocalStorage('messengerCode', '')
const tempMessengerList = ref()

async function saveTempMessenger() {
  const { id } = await myFetch(`/api/save-temp-messenger`, {
    method: 'POST',
    body: {
      id: tempMessengerId.value,
      raw: messengerCode.value
    }
  })
  tempMessengerId.value = id
  ElMessage.success('Temporary messenger saved!')
  tempMessengerList.value.reload()
}

async function deleteTempMessenger(messenger: Messenger) {
  await myFetch(`/api/delete-temp-messenger`, {
    method: 'DELETE',
    body: messenger
  })
  ElMessage.success('Temporary messenger deleted!')
  tempMessengerList.value.reload()
}

function editMessenger(messenger: Messenger) {
  messengerCode.value = messenger.raw
  tempMessengerId.value = messenger.id
  ElMessage.success('Applyed to editor')
  editorContent.value?.scrollIntoView({block: 'start', behavior: 'smooth'})
}
</script>

<template>
  <section max-w-1000 mx-auto py-20 space-y-50>

    <!-- edidor -->
    <section ref="editorContent" border rounded-4>
      <h2 border-b p-10 text="bold 20">
        Editor
        <span text-gray>(JS/TS)</span>
      </h2>
      <Editor
        v-model="messengerCode"
        autofocus
        placeholder="messenger code goes here..."
        :style="{height: '650px'}"
        text-16 />
    </section>

    <Playground :raw="messengerCode" />

      <!-- temp messenger list -->
    <section border rounded-4>
      <h2 border-b p-10 text="bold 20 rose" flex justify-between> 
        Temporay Messengers (Got lost when server restarted)
        <Button type="primary" plain :onClick="saveTempMessenger">Save as Temporary Messenger</Button>
      </h2>
      <MessengerList ref="tempMessengerList" :fetcher="() => myFetch('/api/get-temp-messengers')">
        <ElTableColumn width="250px">
          <template #default="scope">
            <div text-right>
              <ElButton @click="editMessenger(scope.row)" type="primary" text>Edit</ElButton>
              <PopConfirm
                :on-confirm="() => deleteTempMessenger(scope.row)"
                :title="`Delete '${scope.row.id}' ?`">
                <ElButton type="danger" text>Delete</ElButton>
              </PopConfirm>
            </div>
          </template>
        </ElTableColumn>
      </MessengerList>
    </section>

    <!-- messenger list -->
    <section border rounded-4>
      <h2 border-b p-10 text="bold 20"> Messengers </h2>
      <MessengerList :fetcher="() => myFetch('/api/get-messengers')" />
    </section>
  </section>
</template>
