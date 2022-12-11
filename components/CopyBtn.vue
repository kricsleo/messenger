<script setup lang="ts">
import copyToClipboard from 'copy-to-clipboard';
import { ElTooltip } from 'element-plus'

const props = defineProps<{
  modelValue: string
  tip?: string
}>()
const attrs = useAttrs()
const copied = ref(false)
const innerTip = computed(() => copied.value ? 'Copied!' : props.tip || 'Copy' )

function copy() {
  copyToClipboard(props.modelValue)
  copied.value = true
  setTimeout(() => copied.value = false, 1500)
}
</script>

<template>
  <ElTooltip :content="innerTip" placement="right" effect="light">
    <button @click="copy" v-bind="attrs" inline-block active:opacity-65 p-5>
      <div v-if="copied" i-carbon:checkmark />
      <div v-else i-carbon:copy />
    </button>
  </ElTooltip>
</template>
