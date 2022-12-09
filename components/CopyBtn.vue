<script setup lang="ts">
import copyToClipboard from 'copy-to-clipboard';
import { ElTooltip } from 'element-plus'

const props = defineProps<{
  modelValue: string
  tip?: string
}>()
const attrs = useAttrs()
const innerTip = ref(props.tip)

function copy() {
  copyToClipboard(props.modelValue)
  innerTip.value = 'Copied!'
  setTimeout(() => innerTip.value = 'Copy', 1500)
}
</script>

<template>
  <ElTooltip :content="innerTip" placement="right" effect="light">
    <button @click="copy" v-bind="attrs" inline-block active:opacity-65 p-5>
      <div i-carbon:copy />
    </button>
  </ElTooltip>
</template>
