<script setup lang="ts">
import { useSunnyForm } from '@sunny-base-web/ui';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';

// 字段级别插槽示例
const [Form] = useSunnyForm({
  commonConfig: {
    colProps: { span: 24, md: 12, lg: 8 },
  },
  schema: [
    { fieldName: 'name', label: '名称', component: 'Input' },
    // 使用 component: 'Slot' 启用字段插槽，插槽名为 fieldName
    { fieldName: 'tags', label: '标签', component: 'Slot' },
    { fieldName: 'description', label: '描述', component: 'Input', componentProps: { placeholder: '请输入描述' } },
  ],
  handleSubmit: (values) => {
    Message.success('表单提交: ' + JSON.stringify(values));
  },
});

// 使用 setValue 进行双向绑定
function addTag(value: string[], setValue: (val: any) => void) {
  const currentTags = value || [];
  const newTag = `Tag${currentTags.length + 1}`;
  setValue([...currentTags, newTag]);
}

function removeTag(index: number, value: string[], setValue: (val: any) => void) {
  const newTags = [...(value || [])];
  newTags.splice(index, 1);
  setValue(newTags);
}
</script>

<template>
  <div>
    <Form>
      <!-- 插槽名 = fieldName，接收 { model, value, setValue } 参数 -->
      <template #tags="{ model, value, setValue, disabled }">
        <div class="flex flex-wrap items-center gap-2">
          <a-tag
            v-for="(tag, index) in (value || [])"
            :key="index"
            closable
            @close="removeTag(index, value, setValue)"
          >
            {{ tag }}
          </a-tag>
          <a-button size="small" type="outline" @click="addTag(value, setValue)" :disabled="disabled">
            <template #icon>
              <IconPlus />
            </template>
            添加标签
          </a-button>
        </div>
        <!-- model 可以访问整个表单的值 -->
        <div v-if="model.name" class="mt-2 text-xs text-gray-500">
          当前表单名称: {{ model.name }}
        </div>
      </template>
    </Form>
  </div>
</template>
