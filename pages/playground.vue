<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus'
import { useLocalStorage } from '@vueuse/core';
import { ref } from 'vue';
import Button from '~~/components/Button.vue';
import Tester from '~~/components/Tester.vue';
import CopyBtn from '~~/components/CopyBtn.vue';
import TempMessengerList from '~~/components/TempMessengerList.vue';
import Panel from '~~/components/Panel.vue'
import EditorMonaco from '~~/components/Editor/EditorMonaco.vue';

const tempMessengerId = ref()
const messengerCode = useLocalStorage('messengerCode',
`
export function (body, query) {
  return {
    text: 'Hi'
  }
}
`.trim()
)
const tempMessengerHref = useMessengerHref(tempMessengerId)
const drawerVisible = ref(false)
const saveTempMessengerState = useAsync(async () => {
  const { id } = await $fetch(`/api/save-temp-messenger`, {
    method: 'POST',
    body: {
      id: tempMessengerId.value,
      raw: messengerCode.value
    }
  })
  tempMessengerId.value = id
  ElMessage.success('Temporary messenger saved!')
}, null, { immediate: false })

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
      <div border-b p-10 flex items-center>
        <div text="bold 20" justify-self-start>
          Editor <span text-gray>(JS/TS)</span>
        </div>
        <div flex items-center ml-30 mr-auto>
          {{tempMessengerHref}}
          <CopyBtn v-if="tempMessengerHref" :modelValue="tempMessengerHref" tip="Copy href" />
        </div>
        <Button type="primary" plain :onClick="saveTempMessengerState.execute">
          {{tempMessengerId ? 'Update' : 'Save'}}
        </Button>
        <ElButton @click="drawerVisible = !drawerVisible">All temporary messengers</ElButton>
      </div>

      <EditorMonaco language="typescript" v-model="messengerCode" />
      <!-- <Editor
        v-model="messengerCode"
        autofocus
        placeholder="messenger code goes here..."
        :style="{height: '650px'}"
        text-16 /> -->
    </section>

    <Tester :raw="messengerCode" />

    <Panel v-model="drawerVisible" title="Messengers for test only (!!LOST when server restarted)">
      <TempMessengerList @edit="editMessenger" />
    </Panel>
  </section>
</template>
