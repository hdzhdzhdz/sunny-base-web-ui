<template>
  <div class="space-y-4">
    <a-alert>
      CustomizeSelect 是一个支持配置驱动的业务下拉选择组件，支持普通选择和远程搜索两种模式。
      <div class="mt-2 text-xs text-gray-500">
        注意：实际使用时需要确保接口 /core/assSelect/commonQuery 可用
      </div>
    </a-alert>

    <!-- 组件展示 - 普通模式 -->
    <div class="p-4 border rounded">
      <div class="font-bold mb-3">普通模式 (nType=0)</div>
      <div class="flex items-center mb-3">cNum：<a-input v-model="normalNum" /></div>
      <sunny-customize-select
        v-model="normalValue"
        :c-num="normalNum"
        placeholder="请选择..."
        style="width: 300px"
        @select-change="handleNormalChange"
      />
      <div class="mt-2 text-xs text-gray-400">
        当前选中值: {{ normalValue || '未选择' }}
      </div>
    </div>

    <!-- 组件展示 - 远程搜索模式 -->
    <div class="p-4 border rounded">
      <div class="font-bold mb-3">远程搜索模式 (nType=1)</div>
      <div class="flex items-center mb-3">cNum：<a-input v-model="cNum" /></div>
      <sunny-customize-select
        v-model="remoteValue"
        :c-num="cNum"
        placeholder="输入关键词搜索..."
        style="width: 300px"
        @select-change="handleRemoteChange"
      />
      <div class="mt-2 text-xs text-gray-400">
        当前选中值: {{ remoteValue || '未选择' }}
      </div>
    </div>

    <!-- 组件展示 - 带上下文参数 -->
    <!-- <div class="p-4 border rounded">
      <div class="font-bold mb-3">带上下文参数 (attrParam)</div>
      <div class="flex items-center gap-4 mb-3">
        <span class="text-sm">公司ID:</span>
        <a-input-number v-model="companyId" placeholder="1400" style="width: 120px" />
      </div>
      <sunny-customize-select
        v-model="contextValue"
        :c-num="cNum"
        :attr-param="{ companyId }"
        placeholder="选择部门..."
        style="width: 300px"
        @select-change="handleContextChange"
      />
      <div class="mt-2 text-xs text-gray-400">
        当前选中值: {{ contextValue || '未选择' }}
      </div>
    </div> -->

    <!-- 组件展示 - 显示附加信息 -->
    <!-- <div class="p-4 border rounded">
      <div class="font-bold mb-3">显示附加信息 (cLabelslotcol)</div>
      <sunny-customize-select
        v-model="slotValue"
        :c-num="cNum"
        :default-config="{ cLabelslotcol: 'department' }"
        placeholder="选择员工..."
        style="width: 300px"
        @select-change="handleSlotChange"
      />
      <div class="mt-2 text-xs text-gray-400">
        当前选中值: {{ slotValue || '未选择' }}
      </div>
    </div> -->

    <!-- 事件日志 -->
    <div class="p-4 border rounded bg-gray-50">
      <div class="font-bold mb-2">事件日志</div>
      <div class="text-xs font-mono bg-white p-2 rounded border max-h-32 overflow-y-auto">
        <div v-if="logs.length === 0" class="text-gray-400">暂无日志</div>
        <div v-for="(log, index) in logs" :key="index" class="mb-1">
          <span class="text-gray-500">[{{ log.time }}]</span>
          <span class="text-blue-600">{{ log.event }}</span>
          <span class="text-gray-400">{{ log.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SunnyCustomizeSelect } from '@sunny-base-web/ui';

const normalNum = ref('TestZdyxl')
const normalValue = ref<string | number>('');
  
const cNum = ref('UserSearch')
const remoteValue = ref<string | number>('');
const contextValue = ref<string | number>('');
const slotValue = ref<string | number>('');
const companyId = ref(1400);
const logs = ref<Array<{ time: string; event: string; value: string }>>([]);

const addLog = (event: string, value: string | number) => {
  const time = new Date().toLocaleTimeString();
  logs.value.unshift({
    time,
    event,
    value: String(value)
  });
};

const handleNormalChange = (val: string | number) => {
  addLog('普通模式选择变化', val);
};

const handleRemoteChange = (val: string | number) => {
  addLog('远程搜索选择变化', val);
};

const handleContextChange = (val: string | number) => {
  addLog(`上下文变化 (companyId: ${companyId.value})`, val);
};

const handleSlotChange = (val: string | number) => {
  addLog('插槽模式选择变化', val);
};
</script>
