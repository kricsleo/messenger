<script setup lang="ts">
import { Codemirror } from 'vue-codemirror'
import { javascript, esLint } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import copyToClipboard from 'copy-to-clipboard';
import { lintGutter, linter } from "@codemirror/lint";
// @ts-ignore
import Linter from 'eslint4b-prebuilt/dist/eslint4b.es.js'
import { ElButton, ElForm, ElFormItem, ElInput, ElMessage, FormInstance, FormRules, ElTooltip } from 'element-plus'

const extentions = [
  javascript({ typescript: true }),
  // dev mode in vite would overrite "process",
  // that will brake the "Linter" in browser
  process.dev ? null as any : linter(esLint(new Linter())),
  lintGutter(),
  oneDark
].filter(Boolean)

const jsonExtension = [
  javascript(),
  oneDark,
]

const origin = ref('~')



const formRef = ref<FormInstance>()
const form = reactive({
  id: '',
  address: '',
  exchanger: ''
})
const formRules: FormRules = {
  // validate id
  id: { required: true, message: 'subpath is required'},
  // validate address
  address: { required: true, message: 'address is required'},
  // validate default export
  exchanger: { required: true, message: 'exchanger is required'},
}

const messengerPrefix = computed(() => `${origin.value}/api/messenger/`)
const messengerId = ref()
const messengerUrl = computed(() => messengerPrefix.value + form.id)
const address = ref()
const exchanger = ref()

const testData = ref()
const messageReply = ref()

const messengerList = ref<Messenger[]>([])

const templates = ref<Template[]>([])
const templateImports = import.meta.glob('/templates/*.ts', { as: 'raw' })

onMounted(async () => {
  origin.value = window.location.origin
  loadMessengerList()

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

async function saveMessenger() {
  await formRef.value?.validate()
  await $fetch(`${origin.value}/api/save-messenger`, {
    method: 'POST',
    body: {
      id: form.id.trim(),
      exchanger: form.exchanger,
      address: form.address.trim(),
    }
  })
  ElMessage.success('Messenger saved!')
  loadMessengerList()
}

async function deleteMessenger(messenger: Messenger) {
  await $fetch(`${origin.value}/api/delete-messenger`, {
    method: 'DELETE',
    body: {
      id: messenger.id
    }
  })
  loadMessengerList()
}

async function triggerTest() {
  messageReply.value = await $fetch(`${origin.value}/api/test-messenger`, {
    method: 'POST',
    body: <MessengerWithmessage>{
      address: address.value,
      exchanger: exchanger.value,
      message: JSON.parse(testData.value),
    }
  })
}

async function loadMessengerList() {
  const result: any = await $fetch(`${origin.value}/api/get-all-messengers`)
  messengerList.value = result.d.messengers
}

function showMessenger(messenger: Messenger) {
  messengerId.value = messenger.id
  address.value = messenger.address
  exchanger.value = messenger.exchanger
}

function useTemplate(template: Template) {
  exchanger.value = template.exchanger
}

function copy(text: string) {
  copyToClipboard(text)
  ElMessage.success('Copied!')
}
</script>

<template>
  <section text-dark min-w-500 max-w-800 mx-auto my-10>
    <ElForm ref="formRef" :rules="formRules" :model="form" label-suffix=":" label-width="110px">
      <ElFormItem prop="id" label="Messenger">
        <div flex items-center w-full>
          {{messengerPrefix}}&nbsp;
          <ElInput class="grow-1" v-model="form.id" placeholder="please input subpath" />
          <ElTooltip content="Copy href" placement="right-start">
            <div i-carbon:copy @click="copy(messengerUrl)" cursor-pointer ml-10 shrink-0 active:text-gray />
          </ElToolTip>
        </div>
      </ElFormItem>
      <ElFormItem prop="exchanger" label="Exchanger(JS/TS)">
        <div class="w-full">
          <!-- <div text-gray>(Supports JS/TS)</div> -->
          <Codemirror 
            v-model="form.exchanger"
            placeholder="message exchange code goes here..."
            class="w-full"
            :style="{height: '600px'}"
            :autofocus="true"
            :indent-with-tab="true"
            :tab-size="2"
            :extensions="extentions"
            text-16
          />
        </div>
      </ElFormItem>
      <ElFormItem prop="address" label="Address">
        <ElInput v-model="form.address" placeholder="please input href" />
      </ElFormItem>
      <ElFormItem>
        <Button type="primary" :onClick="saveMessenger">Save Messenger</Button>
      </ElFormItem>
    </ElForm>
  </section>

  <section text-dark min-w-500 max-w-800 mx-auto my-10>
    <!-- <div y-center my-10 text-dark-1>
      <span class="title">Messenger: </span>
      {{messengerPrefix}}
      <ElInput />
      <input class="input" v-model="messengerId" grow-1 ml-2 />
      <div i-carbon:copy @click="copyToClipboard(messengerUrl)" cursor-pointer ml-10 title="copy path" />
    </div>

    <div y-center my-10>
      <span class="title">Address: </span>
      <input class="input" v-model="address" grow-1 />
    </div>

    <div y-center flex-wrap my-10>
      <div class="title"> Echanger: </div>
      <span class="text-gray">(support js/ts)</span>
    </div>
    <Codemirror 
      v-model="exchanger"
      placeholder="message exchange code goes here..."
      :style="{height: '800px'}"
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extentions"
      text-16
    />

    <div my-10 x-center>
      <button class="btn" @click="saveMessenger">Save</button>
    </div> -->

    <div border mt-20 />
    <div y-center justify-between>
      <div :style="{width: '44%'}" shrink-0>
        <div y-center flex-wrap my-10>
          <div class="title"> Test Data: </div>
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

      <button class="btn btn--plain" @click="triggerTest" shrink-0>Test =></button>

      <div :style="{width: '44%'}" shrink-0>
        <div y-center flex-wrap my-10>
          <div class="title"> Reply: </div>
        </div>
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

    <div border mt-20 />
    <div>
      <div class="title" my-10> Messengers: </div>
      <div 
        v-for="messengerItem in messengerList" 
        :key="messengerItem.id"
        flex my-10 items-center>
        <span>{{messengerPrefix + messengerItem.id}}</span>
        <div i-carbon:copy @click="copyToClipboard(messengerPrefix + messengerItem.id)" cursor-pointer ml-10 title="copy path" />
        <button class="ml-auto mr-10 btn btn--plain btn--danger" @click="deleteMessenger(messengerItem)">Delete</button>
        <button class="btn btn--plain" @click="showMessenger(messengerItem)">Edit</button>
      </div>
      <div text-gray v-if="!messengerList.length">
        No messengers yet.
      </div>
    </div>

    <div border mt-20 />
    <div>
      <div class="title" my-10> Templates: </div>
      <div>
        <div 
          v-for="templateItem in templates"
          :key="templateItem.id"
          flex my-10>
          <span>{{templateItem.name}}</span>
          <button class="ml-auto btn btn--plain" @click="useTemplate(templateItem)">Use</button>
        </div>
        <div text-gray v-if="!templates.length">
          No Templates yet.
        </div>
      </div>
    </div>

  </section>
</template>

<style scope>
.title {
  width: 100px;
  font-weight: 700;
  font-size: 16px;
}
.input {
  border: 1px solid #444c56;
  padding: 2px 5px;
  border-radius: 6px;
  transition: 80ms cubic-bezier(0.33, 1, 0.68, 1);
  transition-property: color,background-color,box-shadow,border-color;
}
.input:hover {
  border-color: #539bf5;
}
.btn {
  background-color: #347d39;
  color: #fff;
  padding: 5px 16px;
  border: 1px solid rgb(205 217 229 / 10%);
  border-radius: 6px;
  appearance: none;
}
.btn--plain {
  color: #347d39;
  border-color: currentColor;
  background-color: transparent;
}
.btn--danger {
  color: #e5534b;
}
</style>
