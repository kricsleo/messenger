<script setup lang="ts">
import { ElButton, ElMessage, ElDrawer } from 'element-plus'
import { useLocalStorage } from '@vueuse/core';
import Editor from '~~/components/Editor.vue';
import { ref } from 'vue';
import { myFetch } from '~~/utils/utils';
import Button from '~~/components/Button.vue';
import Tester from '~~/components/Tester.vue';
import CopyBtn from '~~/components/CopyBtn.vue';
import TempMessengerList from '~~/components/TempMessengerList.vue';

const tempMessengerId = ref()
const messengerCode = useLocalStorage('messengerCode', '')
const tempMessengerList = ref()
const tempMessengerHref = useMessengerHref(tempMessengerId)
const drawerVisible = ref(false)

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
function editMessenger(messenger: Messenger) {
  messengerCode.value = messenger.raw
  tempMessengerId.value = messenger.id
  drawerVisible.value = false
  ElMessage.success('Applyed to editor')
}
</script>

<template>
  <section space-y-50>
    <!-- edidor -->
    <section ref="editorContent" border rounded-4>
      <div border-b p-10 grid="~ cols-[1fr_1fr_1fr]">
        <div text="bold 20" justify-self-start>
          Editor <span text-gray>(JS/TS)</span>
        </div>
        <div justify-self-center flex items-center>
          {{tempMessengerHref}}
          <CopyBtn v-if="tempMessengerHref" :modelValue="tempMessengerHref" tip="Copy href" />
        </div>
        <div justify-self-end>
          <Button type="primary" plain :onClick="saveTempMessenger">
            {{tempMessengerId ? 'Update' : 'Save'}}
          </Button>
          <ElButton @click="drawerVisible = !drawerVisible">All temporary messengers</ElButton>
        </div>
      </div>
      <Editor
        v-model="messengerCode"
        autofocus
        placeholder="messenger code goes here..."
        :style="{height: '650px'}"
        text-16 />
    </section>

    <Tester :raw="messengerCode" />

    <ClientOnly>
      <ElDrawer v-model="drawerVisible" size="820px" :withHeader="false">
        <TempMessengerList @edit="editMessenger" />
      </ElDrawer>
    </ClientOnly>
  </section>
</template>
