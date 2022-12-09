<script setup lang="ts">
import copyToClipboard from 'copy-to-clipboard';
import { ElButton, ElMessage, ElTable, ElTableColumn, ElInput } from 'element-plus'
import { useLocalStorage } from '@vueuse/core';
import Editor from '~~/components/Editor.vue';
import { ref, computed, onMounted } from 'vue';
import { useAsync, myFetch } from '~~/utils/utils';
import Button from '~~/components/Button.vue';
import MessengerList from '~~/components/MessengerList.vue'

const messengerPrefix = ref('')

const editorContent = ref<HTMLDivElement>()
const tempMessengerId = ref()
const messengerCode = useLocalStorage('messengerCode', '')
const testData = useLocalStorage('testData', `{}`)
const messageReply = ref()

const messengerListState = useAsync<Messenger[]>(
  () => myFetch(`/api/get-all-messengers`).then(result => result.messengers),
  []
)
const tempMessengerList = computed(() => messengerListState.data.filter(messenger => messenger.temp))

onMounted(() => {
  messengerPrefix.value = `${window.location.origin}/api/messenger/`
})

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
  messengerListState.execute()
}

async function deleteTempMessenger(messenger: Messenger) {
  await myFetch(`/api/delete-temp-messenger`, {
    method: 'DELETE',
    body: messenger
  })
  ElMessage.success('Temporary messenger deleted!')
  messengerListState.execute()
}

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
      raw: messengerCode.value,
      message,
    }
  })
  ElMessage.success('Test triggered')
}

function copy(text: string) {
  copyToClipboard(text)
  ElMessage.success('Copied!')
}

function editMessenger(messenger: Messenger) {
  messengerCode.value = messenger.raw
  tempMessengerId.value = messenger.id
  ElMessage.success('Applyed to editor')
  editorContent.value?.scrollIntoView({behavior: 'smooth'})
}

function getMessengerHref(messengerId: string) {
  return messengerPrefix.value + messengerId
}
</script>

<template>
  <section max-w-1000 mx-auto py-20 space-y-30>

    <!-- edidor -->
    <section ref="editorContent" border rounded-4>
      <h2 border-b p-10 text="bold 20">
        Editor
        <span text-gray>(JS/TS)</span>
      </h2>
      <Editor
        v-model="messengerCode"
        placeholder="messenger code goes here..."
        :style="{height: '650px'}"
        :autofocus="true"
        text-16 />
    </section>

    <!-- playground -->
    <section border rounded-4>
      <h2 border-b p-10 text="bold 20" flex justify-between>
        Playground
        <Button type="primary" plain :onClick="triggerTest">Run Test</Button>
      </h2>
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

      <!-- temp messenger list -->
    <section border rounded-4>
      <h2 border-b p-10 text="bold 20 rose" flex justify-between> 
        Temporay Messengers (Got lost when server restarted)
        <Button type="primary" plain :onClick="saveTempMessenger">Save Temporary Messenger</Button>
      </h2>
      <ElTable :show-header="false" :data="tempMessengerList" empty-text="No temporary messengers yet.">
        <ElTableColumn width="400px" :formatter="(row: Messenger) => getMessengerHref(row.id)" />
        <ElTableColumn show-overflow-tooltip :formatter="(row: Messenger) => row.meta?.description || '-'" />
        <ElTableColumn width="250px">
          <template #default="scope">
            <div text-right>
              <ElButton @click="copy(getMessengerHref(scope.row.id))">
                <div i-carbon:copy />
              </ElButton>
              <ElButton @click="editMessenger(scope.row)">Edit</ElButton>
              <PopConfirm
                :on-confirm="() => deleteTempMessenger(scope.row)"
                :title="`Delete '${getMessengerHref(scope.row.id)}' ?`">
                <ElButton type="danger" plain>Delete</ElButton>
              </PopConfirm>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </section>

    <!-- messenger list -->
    <section border rounded-4>
      <h2 border-b p-10 text="bold 20"> Messengers </h2>
      <MessengerList />
    </section>
  </section>
</template>
