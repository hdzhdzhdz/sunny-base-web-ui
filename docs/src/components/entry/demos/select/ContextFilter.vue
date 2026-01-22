<template>
  <div class="space-y-4">
    <a-alert>
      修改下方的表单上下文（模拟业务表单），观察下拉框选项的动态变化。
    </a-alert>

    <!-- 模拟表单上下文 -->
    <div class="p-4 border rounded bg-gray-50">
      <div class="font-bold mb-3">当前表单上下文 (filterModel)</div>
      <a-form :model="formModel" layout="inline">
        <a-form-item label="公司ID (company)">
          <a-input-number v-model="formModel.company" placeholder="例如: 1400" />
        </a-form-item>
        <a-form-item label="用户角色 (role)">
          <a-select v-model="formModel.role" placeholder="选择角色" style="width: 120px">
            <a-option value="user">User (普通)</a-option>
            <a-option value="admin">Admin (管理)</a-option>
          </a-select>
        </a-form-item>
      </a-form>
      <div class="mt-2 text-xs text-gray-500">
        * 尝试将公司ID改为 1400，或将角色切换为 Admin
      </div>
    </div>

    <!-- 组件展示 -->
    <div class="p-4 border rounded">
      <div class="font-bold mb-3">KunkkaSelect 组件</div>
      <kunkka-select
        v-model="value"
        :options="options"
        :filter-model="formModel"
        placeholder="请选择..."
        allow-clear
        style="width: 300px"
      />
      <div class="mt-2 text-xs text-gray-400">
        当前选中值: {{ value || '未选择' }}
      </div>
    </div>

    <!-- 选项数据展示 -->
    <div class="p-4 border rounded bg-gray-50">
      <div class="font-bold mb-2">选项数据源 (Options Configuration)</div>
      <div class="text-xs font-mono bg-white p-2 rounded border">
        <div v-for="(opt, index) in options" :key="index" class="mb-1">
          <span class="text-blue-600">{{ opt.label }}</span>
          <span class="text-gray-400 mx-2">=></span>
          <span v-if="!opt.cMeta" class="text-green-600">通用选项 (始终显示)</span>
          <span v-else class="text-orange-600">
            限制条件: {{ JSON.stringify(opt.cMeta) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const value = ref();

// 模拟表单上下文
const formModel = reactive({
  company: 1400,
  role: 'user'
});

// 定义选项，包含 cMeta 限制条件
const options = [
  { 
    label: '通用选项 A', 
    value: 'common_a' 
  },
  { 
    label: '公司1400 专用', 
    value: 'company_1400',
    cMeta: { company: 1400 } // 只有当 formModel.company == 1400 时显示
  },
  { 
    label: '公司1500 专用', 
    value: 'company_1500',
    cMeta: { company: 1500 } // 只有当 formModel.company == 1500 时显示
  },
  { 
    label: '管理员 专用', 
    value: 'role_admin',
    cMeta: { role: 'admin' } // 只有当 formModel.role == 'admin' 时显示
  },
  { 
    label: '公司1400 的管理员', 
    value: 'company_1400_admin',
    cMeta: { company: 1400, role: 'admin' } // 只有当 formModel.company == 1400 且 role == 'admin' 时显示
  }
];
</script>
