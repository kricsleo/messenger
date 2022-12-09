<script setup lang="ts">
import { ElIcon, ElTooltip, popconfirmProps, ElButton, TooltipInstance } from 'element-plus';
import { computed, PropType, ref } from 'vue';
import { useAsync } from '~~/utils/utils';

const props = defineProps({
  ...popconfirmProps,
  onConfirm: {
    type: Function as PropType<() => Promise<void>>,
    required: true,
  },
});

const tooltipRef = ref<TooltipInstance>();
const asyncState = computed(() => useAsync(props.onConfirm, null, { immediate: false }));
const close = () => tooltipRef.value?.onClose?.();
const handleCancel = (e: Event) => {
  props.onCancel?.(e);
  close();
};
const handleConfirm = async (e: Event) => {
  await asyncState.value.execute(e);
  close();
};
</script>

<template>
  <ElTooltip
    ref="tooltipRef"
    v-bind="props"
    trigger="click"
    effect="light"
    popper-class="el-popover"
    :hide-after="0"
    :fallback-placements="['bottom', 'top', 'right', 'left']">
    <template #content>
      <div class="el-popconfirm__main flex items-center py-10">
        <ElIcon v-if="!props.hideIcon && props.icon" class="el-popconfirm__icon mr-5" :style="{ color: iconColor }">
          <component :is="props.icon" />
        </ElIcon>
        {{ props.title }}
      </div>
      <div class="el-popconfirm__action">
        <ElButton
          size="small"
          :type="props.cancelButtonType === 'text' ? '' : props.cancelButtonType"
          :text="props.cancelButtonType === 'text'"
          @click="handleCancel">
          {{ props.cancelButtonText || 'cancel' }}
        </ElButton>
        <ElButton
          size="small"
          :type="props.confirmButtonType === 'text' ? '' : props.confirmButtonType"
          :text="props.confirmButtonType === 'text'"
          :loading="asyncState.loading"
          @click="handleConfirm">
          {{ props.confirmButtonText || 'confirm' }}
        </ElButton>
      </div>
    </template>
    <template v-if="$slots.default">
      <slot />
    </template>
  </ElTooltip>
</template>
