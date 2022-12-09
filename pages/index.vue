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
import CopyBtn from '~~/components/CopyBtn.vue';

const editorContent = ref<HTMLDivElement>()
const tempMessengerId = ref()
const messengerCode = useLocalStorage('messengerCode', '')
const tempMessengerList = ref()
const tempMessengerHref = useMessengerHref(tempMessengerId)

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
      <div border-b p-10 grid="~ cols-[1fr_2fr_1fr]">
        <div text="bold 20" justify-self-start>
          Editor <span text-gray>(JS/TS)</span>
        </div>
        <div justify-self-center flex items-center>
          {{tempMessengerHref}}
          <CopyBtn v-if="tempMessengerHref" :modelValue="tempMessengerHref" tip="Copy href" />
        </div>
        <Button type="primary" plain :onClick="saveTempMessenger" class="justify-self-end">
          {{tempMessengerId ? 'Update' : 'Save as Temporary Messenger'}}
        </Button>
      </div>
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
        Messengers for test only (Got lost when server restarted)
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
