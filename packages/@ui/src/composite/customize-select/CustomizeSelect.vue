<template>
  <div class="w-full">
    <!-- 根据config.nType == 1控制是否可搜索 -->
    <a-select
      v-model="newValue"
      allow-clear
      :allow-search="config.nType == 1"
      :loading="loading"
      :error="error"
      v-bind="$attrs"
      @change="selectChange"
      @clear="handleClear"
      @search="remoteMethod"
      :triggerProps="{
        contentClass: 'customize-select-content',
      }"
    >
      <a-option
        v-for="x in optionlist"
        :key="x[props.fieldNames.value]"
        :label="x[props.fieldNames.label]"
        :value="x[props.fieldNames.value]"
      >
        <template v-if="config.cLabelslotcol">
          <div class="flex justify-between items-center w-full">
            <span>{{ x.cKeyname }}</span>
            <span class="text-[var(--color-text-3)] text-xs">{{ x.cSlot }}</span>
          </div>
        </template>
      </a-option>
    </a-select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue'
import { debounce, toString } from 'lodash-es'
import { Select, Option, Message } from '@arco-design/web-vue'
import { DEFAULT_FORM_COMMON_CONFIG } from '../../entry/form/config'

const aSelect = Select
const aOption = Option

interface CustomizeSelectConfig {
  nType?: number
  cLabelslotcol?: string
  nSearchinterval?: number
}

interface CustomizeSelectOption {
  cKeynumb: string | number
  cKeyname: string
  cSlot?: string
}

interface CustomizeSelectProps {
  value?: string | number
  cNum?: string | number
  defaultQuery?: boolean
  defaultConfig?: CustomizeSelectConfig
  attrParam?: Record<string, any>
  fieldNames?: {
    label: string
    value: string
  }
}

interface CustomizeSelectEmits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'selectChange', value: string | number, instance: any): void
  (e: 'change', data: { value: string | number; $this: any }): void
}

const props = withDefaults(defineProps<CustomizeSelectProps>(), {
  value: '',
  cNum: '',
  defaultQuery: true,
  defaultConfig: () => ({}),
  attrParam: () => ({}),
  fieldNames: () => ({
    label: 'cKeyname',
    value: 'cKeynumb'
  })
})

const emit = defineEmits<CustomizeSelectEmits>()

defineOptions({
  name: 'SunnyCustomizeSelect',
  inheritAttrs: true
})

const instance = getCurrentInstance()

const config = ref<CustomizeSelectConfig>({
  nType: 1,
  cLabelslotcol: '',
  nSearchinterval: 700
})

const optionlist = ref<CustomizeSelectOption[]>([
  {
    cKeynumb: '',
    cKeyname: '',
    cSlot: ''
  }
])
const defaultOptionlist = ref<CustomizeSelectOption[]>([])
const loading = ref(false)
const error = ref(false)

const newValue = computed({
  get: () => props.value,
  set: (v) => {
    emit('update:modelValue', v)
  }
})

const search = async () => {
  if (props.cNum) {
    try {
      const adapter = DEFAULT_FORM_COMMON_CONFIG.customizeSelectAdapter
      if (!adapter?.query) {
        error.value = true
        Message.error('CustomizeSelect adapter not configured')
        return
      }
      const payload: Record<string, any> = {
        cNum: props.cNum,
        attrParam: {
          ...props.attrParam
        }
      }
      if (newValue.value) {
        payload.cVal = toString(newValue.value)
      }
      const res = await adapter.query(payload)
      optionlist.value = res.options || []
      defaultOptionlist.value = res.options || []
      if (res.config) {
        config.value = Object.assign({}, config.value, res.config)
      }
      error.value = false
    } catch (e: any) {
      error.value = true
      Message.error(e?.message || '加载失败')
    }
  }
}

const selectChange = (value: string | number) => {
  emit('selectChange', value, instance?.proxy)
}

const remoteMethod = debounce((queryString: string) => {
  if (queryString !== '') {
    loading.value = true
    const adapter = DEFAULT_FORM_COMMON_CONFIG.customizeSelectAdapter
    const json: Record<string, any> = {
      cNum: props.cNum,
      attrParam: {
        ...props.attrParam
      },
      searchCondition: queryString
    }
    Promise.resolve()
      .then(async () => {
        if (!adapter?.query) {
          throw new Error('CustomizeSelect adapter not configured')
        }
        return adapter.query(json)
      })
      .then((res) => {
        if (res.config) {
          config.value = Object.assign({}, config.value, res.config)
        }
        optionlist.value = res.options || []
        defaultOptionlist.value = res.options || []
      })
      .catch((e: any) => {
        Message.error(e?.message || '查询失败')
      })
      .finally(() => {
        loading.value = false
      })
  } else {
    optionlist.value = defaultOptionlist.value
  }
}, config.value.nSearchinterval || 700)

const handleClear = () => {
  remoteMethod('')
}

watch(
  () => props.attrParam,
  () => {
    search()
  },
  { deep: true }
)

onMounted(() => {
  if (props.defaultQuery && props.defaultQuery === true) {
    search()
  } else if (props.cNum && props.defaultQuery === false) {
    config.value = Object.assign({}, config.value, props.defaultConfig)
  }
})
</script>

<style lang="scss">
.customize-select-content {
  .arco-select-option-content {
    width: 100%;
  }
}
</style>
