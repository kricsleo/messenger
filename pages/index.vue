<script setup lang="ts">
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import copyToClipboard from 'copy-to-clipboard';

const extentions = [javascript({ typescript: true }), oneDark]

const origin = ref('~')

// const origin = 'http://localhost:3000'
const messengerPrefix = computed(() => `${origin.value}/api/messenger/`)
const messengerId = ref()
const messengerUrl = computed(() => messengerPrefix.value + messengerId.value)
const address = ref()
const exchanger = ref()

const testData = ref()
const messegeReply = ref()

const messengerList = ref<Messenger[]>()

onMounted(() => {
  origin.value = window.location.origin
  loadMessengerList()
})

async function saveMessenger() {
  // todo: validate code before submit
  await $fetch(`${origin.value}/api/save-messenger`, {
    method: 'POST',
    body: { 
      id: messengerId.value,
      address: address.value,
      exchanger: exchanger.value
    }
  })
  loadMessengerList()
}

async function triggerTest() {
  messegeReply.value = await $fetch(messengerUrl.value, {
    method: 'POST',
    body: JSON.parse(testData.value)
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
</script>

<template>
  <section text-dark min-w-500 max-w-800 mx-auto my-10>
    <div y-center my-10 text-dark-1>
      <span class="title">Messenger: </span>
      {{messengerPrefix}}
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
      placeholder="Message exchange code goes here..."
      :style="{height: '800px'}"
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extentions"
    />

    <div my-10 x-center>
      <button class="btn" @click="saveMessenger">Save</button>
    </div>

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
          :extensions="extentions"
        />
      </div>

      <button class="btn btn--plain" @click="triggerTest" shrink-0>Test =></button>

      <div :style="{width: '44%'}" shrink-0>
        <div y-center flex-wrap my-10>
          <div class="title"> Reply: </div>
        </div>
        <Codemirror 
          :model-value="JSON.stringify(messegeReply, null, 2)"
          placeholder="Test data reply goes here..."
          :style="{height: '400px'}"
          :indent-with-tab="true"
          :tab-size="2"
          read-only
          :extensions="extentions"
        />
      </div>
    </div>

    <div border mt-20 />
    <div>
      <div class="title" my-10> Messengers: </div>
      <div 
        v-for="messengerItem in messengerList" 
        :key="messengerItem.id"
        flex my-10 justify-between>
        <span>{{messengerPrefix}}{{messengerItem.id}}</span>
        <button class="btn btn--plain" @click="showMessenger(messengerItem)">Edit</button>
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
</style>
