# 全局表单 Disabled 配置功能 - 使用指南

## 🎯 功能概述

实现了**五层优先级**的表单禁用控制机制，支持从应用级到字段级的灵活控制。

## 📊 优先级说明（从高到低）

```
1. dependencies.disabled     (最高优先级 - 动态联动)
   ↓
2. schema.disabled           (字段级配置)
   ↓
3. componentProps.disabled   (组件属性配置)
   ↓
4. commonConfig.disabled     (表单级配置 - 新增)
   ↓
5. FormCommonConfig.disabled (全局级配置 - 新增，最低优先级)
```

**设计理念：** 范围越小，优先级越高

---

## 🚀 快速开始

### 1. 全局禁用（应用级）

在应用启动时配置全局默认禁用状态：

```typescript
// apps/web/src/bootstrap.ts
import { setupBusinessForm } from '@sunny-base-web/effects';

async function bootstrap() {
  // ✅ 根据用户权限设置全局禁用
  setupBusinessForm({
    config: {
      disabled: false,  // 默认不禁用
      // disabled: authStore.isReadOnly,  // 动态控制
    }
  });
}
```

**适用场景：**
- 审批流程（根据权限动态控制）
- 系统维护模式（全局只读）
- 特定用户角色（访客只读）

---

### 2. 表单级禁用

在单个表单中统一控制所有字段：

```vue
<template>
  <!-- ✅ 详情页：所有字段禁用 -->
  <SunnyForm
    :schema="schema"
    :common-config="{ disabled: true }"
  />
</template>
```

**适用场景：**
- 详情页面（只读查看）
- 审批页面（禁止编辑）
- 历史记录（不可修改）

---

### 3. 部分字段可编辑

在表单级禁用的基础上，允许特定字段编辑：

```vue
<script setup lang="ts">
const schema = [
  {
    fieldName: 'name',
    label: '姓名',
    disabled: false,  // ✅ 覆盖表单级禁用，允许编辑
  },
  {
    fieldName: 'status',
    label: '状态',
    // 继承表单级禁用，不可编辑
  },
];
</script>

<template>
  <SunnyForm
    :schema="schema"
    :common-config="{ disabled: true }"
  />
</template>
```

**适用场景：**
- 审批表单（部分字段可修改）
- 订单详情（可修改备注，其他不可编辑）
- 配置页面（核心配置只读，其他可编辑）

---

### 4. 动态联动禁用（最高优先级）

根据其他字段的值动态控制禁用状态：

```vue
<script setup lang="ts">
const schema = [
  {
    fieldName: 'type',
    label: '类型',
  },
  {
    fieldName: 'reason',
    label: '原因',
    dependencies: {
      // ✅ 只有当 type 为 'other' 时才启用
      // 优先级最高，覆盖所有其他配置
      disabled: (values) => values.type !== 'other',
    }
  },
];
</script>

<template>
  <SunnyForm
    :schema="schema"
    :common-config="{ disabled: true }"
  />
</template>
```

**适用场景：**
- 条件性字段（选择"其他"时才可填写原因）
- 联动控制（选择特定选项后启用相关字段）
- 复杂业务逻辑（根据表单状态动态控制）

---

## 🎨 完整示例

### 场景：审批表单

```vue
<template>
  <div class="approval-form">
    <h2>采购审批单</h2>

    <!-- ✅ 表单级禁用：审批人只能修改审批意见 -->
    <SunnyForm
      :schema="schema"
      :common-config="commonConfig"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@sunny-base-web/stores';

const authStore = useAuthStore();

// Schema 配置
const schema = [
  {
    fieldName: 'purchaseNo',
    label: '采购单号',
    component: 'Input',
    // 继承表单级禁用：不可编辑
  },
  {
    fieldName: 'applicant',
    label: '申请人',
    component: 'Input',
    // 继承表单级禁用：不可编辑
  },
  {
    fieldName: 'amount',
    label: '金额',
    component: 'InputNumber',
    // 继承表单级禁用：不可编辑
  },
  {
    fieldName: 'approvalComment',
    label: '审批意见',
    component: 'Textarea',
    disabled: false,  // ✅ 覆盖表单级禁用：审批人可编辑
  },
  {
    fieldName: 'rejectionReason',
    label: '拒绝原因',
    component: 'Textarea',
    dependencies: {
      // ✅ 动态联动：只有选择"拒绝"时才启用
      disabled: (values) => values.approvalStatus !== 'rejected',
    }
  },
];

// 根据角色动态配置
const commonConfig = computed(() => {
  return {
    disabled: !authStore.canApprove,  // 非审批人：所有字段禁用
  };
});

const handleSubmit = (values: any) => {
  console.log('提交审批：', values);
};
</script>
```

---

## ⚠️ 注意事项

### 1. 向后兼容性

- ✅ **完全兼容**：所有现有代码无需修改
- ✅ **默认行为不变**：`disabled` 默认为 `false`
- ✅ **字段级配置依然有效**：现有的 `schema.disabled` 继续工作

### 2. 性能考虑

- ✅ 使用 `computed` 缓存计算结果
- ✅ 短路求值优化（遇到 `true` 立即返回）
- ✅ 不影响现有表单性能

### 3. 最佳实践

#### ✅ 推荐用法

```typescript
// ✅ 推荐：使用全局禁用控制应用级权限
setupBusinessForm({
  config: {
    disabled: authStore.isReadOnly,
  }
});

// ✅ 推荐：使用表单级禁用控制页面状态
<SunnyForm :common-config="{ disabled: isDetailPage }" />

// ✅ 推荐：使用 Schema 禁用控制特定字段
{
  fieldName: 'createdAt',
  disabled: true,  // 创建时间永远不可编辑
}

// ✅ 推荐：使用 dependencies 实现动态联动
{
  fieldName: 'endDate',
  dependencies: {
    disabled: (values) => !values.startDate,
  }
}
```

#### ❌ 避免用法

```typescript
// ❌ 避免：同时配置多个层级导致混淆
{
  disabled: true,  // Schema 禁用
  componentProps: {
    disabled: false,  // Props 禁用
  },
  dependencies: {
    disabled: () => false,  // 依赖禁用
  }
}
```

---

## 📝 测试验证

### 测试步骤

1. **全局禁用测试**
   ```typescript
   // bootstrap.ts
   setupBusinessForm({
     config: {
       disabled: true,
     }
   });
   ```
   - ✅ 所有表单字段被禁用
   - ✅ 字段级 `disabled: false` 可以覆盖

2. **表单级禁用测试**
   ```vue
   <SunnyForm :common-config="{ disabled: true }" />
   ```
   - ✅ 当前表单所有字段被禁用
   - ✅ 不影响其他表单实例

3. **优先级测试**
   - ✅ dependencies.disabled > schema.disabled > commonConfig.disabled > FormCommonConfig.disabled

---

## 🔧 故障排查

### 问题 1：字段没有按预期禁用

**可能原因：**
- 多个层级同时配置，优先级混淆
- 依赖函数返回值错误

**解决方案：**
```typescript
// ✅ 使用调试工具
const shouldDisabled = computed(() => {
  console.log('isDisabled:', isDisabled.value);
  console.log('schema.disabled:', props.schema.disabled);
  console.log('formDisabled:', props.schema.formDisabled);
  console.log('globalDisabled:', globalDisabled.value);

  return isDisabled.value ||
    props.schema.disabled ||
    props.schema.formDisabled ||
    globalDisabled.value;
});
```

### 问题 2：全局配置不生效

**可能原因：**
- `setupBusinessForm` 未调用
- 配置对象格式错误

**解决方案：**
```typescript
// ✅ 确保在应用入口调用
// apps/web/src/bootstrap.ts
async function bootstrap() {
  // 必须在创建表单之前调用
  setupBusinessForm({
    config: {
      disabled: true,  // ✅ 正确配置
    }
  });

  // ... 其他初始化代码
}
```

---

## 📚 相关文档

- [表单组件开发规范](../../.claude/rules/packages/ui.md)
- [全局配置说明](./config.ts)
- [依赖联动机制](./dependencies.ts)

---

## 🎉 总结

全局表单 Disabled 配置功能提供了**五层优先级**的灵活控制机制：

1. **全局级**：应用级权限控制
2. **表单级**：页面级状态控制
3. **字段级**：精细化的字段控制
4. **组件级**：组件属性控制
5. **依赖级**：动态联动控制

**核心优势：**
- ✅ 灵活：支持多种控制层级
- ✅ 简洁：声明式配置
- ✅ 强大：优先级清晰
- ✅ 兼容：完全向后兼容

**推荐场景：**
- 审批流程（权限控制）
- 详情页面（只读查看）
- 动态表单（条件联动）
- 系统维护（全局只读）
