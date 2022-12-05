<script setup lang="ts">
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import copyToClipboard from 'copy-to-clipboard';
import { ElButton, ElForm, ElFormItem, ElInput, ElMessage, FormInstance, FormRules, ElTooltip, ElTable, ElTableColumn } from 'element-plus'
import { useLocalStorage } from '@vueuse/core';

const jsExtentions = [
  javascript({ typescript: true }),
  oneDark
].filter(Boolean)
const jsonExtension = [
  javascript(),
  oneDark,
]

const origin = ref('~')

const tempMessengerId = ref()
const messengerCode = useLocalStorage('messengerCode', '')
const messengerPrefix = computed(() => `${origin.value}/api/messenger/`)
const testData = useLocalStorage('testData', `{}`)
const messageReply = ref()
const messengerList = ref<Messenger[]>([])
const tempMessengerList = computed(() => messengerList.value.filter(messenger => messenger.temp))
const persistedMessengerList = computed(() => messengerList.value.filter(messenger => !messenger.temp))
const templates = ref<Template[]>([])
const templateImports = import.meta.glob('/templates/*.ts', { as: 'raw' })
const editorContent = ref<HTMLDivElement>()

const myFetch = $fetch.create({
  onRequestError({ error }) {
    ElMessage.error(error.message) 
  },
  async onResponse({ response }) {
    const data = response._data
    if(data?.c !== 0) {
      ElMessage.error(data?.m || 'Unknown error')  
      return Promise.reject(response)
    }
    response._data = data.d
  },
  onResponseError({ error }) {
    ElMessage.error(error?.message || 'Unknown error')
  },
})

onMounted(async () => {
  origin.value = window.location.origin
  loadMessengerList()

  // init random messenger id
  // myFetch('/api/get-messenger-id')
  //   .then(result => form.id = result.id)

  templates.value = await Promise.all(Object.entries(templateImports).map(async ([filename, im]) => {
    const exchanger = await im() as unknown as string
    const templateName = filename.split('/').pop()?.slice(0, -3) || 'unknown template'
    return {
      id: templateName,
      name: templateName,
      exchanger
    }
  }))
})

async function saveTempMessenger() {
  const { id } = await myFetch(`${origin.value}/api/save-temp-messenger`, {
    method: 'POST',
    body: {
      id: tempMessengerId.value,
      raw: messengerCode.value
    }
  })
  tempMessengerId.value = id
  ElMessage.success('Temporary messenger saved!')
  loadMessengerList()
}

async function deleteTempMessenger(messenger: Messenger) {
  await myFetch(`${origin.value}/api/delete-temp-messenger`, {
    method: 'DELETE',
    body: messenger
  })
  ElMessage.success('Temporary messenger deleted!')
  loadMessengerList()
}

async function triggerTest() {
  let message
  try {
    message = JSON.parse(testData.value)
  } catch(e) {
    ElMessage.error('Test data is not a valid json')
    return
  }
  messageReply.value = await myFetch(`${origin.value}/api/test-messenger`, {
    method: 'POST',
    body: {
      raw: messengerCode.value,
      message,
    }
  })
}

async function loadMessengerList() {
  const result: any = await myFetch(`${origin.value}/api/get-all-messengers`)
  messengerList.value = result.messengers
}

function copy(text: string) {
  copyToClipboard(text)
  ElMessage.success('Copied!')
}

function forkMessenger(messenger: Messenger, temp = false) {
  messengerCode.value = messenger.raw
  temp && (tempMessengerId.value = messenger.id)
  ElMessage.success('Forked!')
  editorContent.value?.scrollIntoView({behavior: 'smooth'})
}

function getMessengerHref(messengerId: string) {
  return messengerPrefix.value + messengerId
}
</script>

<template>
  <section text-dark max-w-800 mx-auto py20 space-y-30>

    <!-- edidor -->
    <section ref="editorContent" border rounded-4>
      <h2 border-b py10 text="bold 20 center">
        Messenger Editor
        <span text-gray>(JS/TS)</span>
      </h2>
      <Codemirror 
        v-model="messengerCode"
        placeholder="messenger code goes here..."
        :style="{height: '600px', width: '100%'}"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="2"
        :extensions="jsExtentions"
        text-16
      />
    </section>

    <!-- playground -->
    <section border rounded-4>
      <h2 relative border-b py10 text="bold 20 center">
        Messenger Playground
        <Button class="!absolute right-10" type="primary" plain :onClick="triggerTest">Run Test</Button>
      </h2>
      <div flex justify-between px20 pb-20>
        <div :style="{width: '49%'}" shrink-0>
          <div text-16 py10> 
            Test Data: 
            <span class="text-gray">(JSON format)</span>
          </div>
          <Codemirror 
            v-model="testData"
            placeholder="Test data goes here..."
            :style="{height: '400px'}"
            :indent-with-tab="true"
            :tab-size="2"
            :extensions="jsonExtension"
            text-16
          />
        </div>
        <div :style="{width: '49%'}" shrink-0>
          <div text-16 py10> Reply: </div>
          <Codemirror 
            :model-value="JSON.stringify(messageReply, null, 2)"
            placeholder="Test data replyed here"
            disabled
            :style="{height: '400px'}"
            :indent-with-tab="true"
            :tab-size="2"
            :extensions="jsonExtension"
            text-16
          />
        </div>
      </div>
    </section>

      <!-- temp messenger list -->
    <section border border-b-none rounded-4 overflow-hidden>
      <h2 relative border-b py10 text="bold 20 center rose"> 
        Temporay Messengers (Test only)
        <Button class="!absolute right-10" type="primary" plain :onClick="saveTempMessenger">Save Temporary Messenger</Button>
      </h2>
      <ElTable :show-header="false" :data="tempMessengerList" empty-text="No temporary messengers yet.">
        <ElTableColumn width="400px" :formatter="(row: Messenger) => getMessengerHref(row.id)" />
        <ElTableColumn show-overflow-tooltip :formatter="(row: Messenger) => row.meta.description || '-'" />
        <ElTableColumn width="250px">
          <template #default="scope">
            <div text-right>
              <ElButton @click="copy(getMessengerHref(scope.row.id))">
                <div i-carbon:copy />
              </ElButton>
              <ElButton @click="forkMessenger(scope.row, true)">Edit</ElButton>
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

    <!-- persisted messenger list -->
    <section border border-b-none rounded-4 overflow-hidden>
      <h2 border-b py10 text="bold 20 center"> Persisted Messengers </h2>
      <ElTable :show-header="false" :data="persistedMessengerList" empty-text="No messengers yet.">
        <ElTableColumn width="400px" :formatter="(row: Messenger) => getMessengerHref(row.id)" />
        <ElTableColumn show-overflow-tooltip :formatter="(row: Messenger) => row.meta.description || '-'" />
        <ElTableColumn width="200px">
          <template #default="scope">
            <div text-right>
              <ElButton @click="copy(getMessengerHref(scope.row.id))">
                <div i-carbon:copy />
              </ElButton>
              <ElButton @click="forkMessenger(scope.row)">Fork</ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </section>

    <!-- templates -->
    <!-- <section border rounded-4>
      <h2 border-b py10 text="bold 20 center"> Templates </h2>
      <div 
        v-for="templateItem in templates"
        :key="templateItem.id"
        flex my-10>
        <span>{{templateItem.name}}</span>
        <button class="ml-auto btn btn--plain" @click="useTemplate(templateItem)">Use</button>
      </div>
      <div text-gray text-center my20 v-if="!templates.length">
        No Templates yet.
      </div>
    </section> -->

  </section>
</template>
