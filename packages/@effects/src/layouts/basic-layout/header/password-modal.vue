<!--
  * 修改密码弹窗
  * 使用封装的 Modal 和 Form 组件
-->
<template>
  <Modal
    v-model="visible"
    title="修改密码"
    :width="460"
    :fullscreen="false"
    :ok-loading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <Form />
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@sunny-base-web/stores';
import { Modal, useSunnyForm } from '@sunny-base-web/ui';
import { requestClient } from '../../../api/request';
import { Message } from '@arco-design/web-vue';
import { z } from 'zod';

defineOptions({ name: 'PasswordModal' });

const userStore = useUserStore();
const visible = ref(false);
const loading = ref(false);

// 表单 schema
const [Form, formApi] = useSunnyForm({
  schema: [
    {
      fieldName: 'cOldPwd',
      label: '原密码',
      component: 'InputPassword',
      defaultValue: '',
      rules: z.preprocess((val) => val ?? '', z.string().min(1, '请输入原密码')),
      componentProps: {
        placeholder: '请输入原密码',
        allowClear: true,
      },
    },
    {
      fieldName: 'cNewPwd',
      label: '新密码',
      component: 'InputPassword',
      defaultValue: '',
      rules: z.preprocess((val) => val ?? '', z.string().min(6, '密码至少6位')),
      componentProps: {
        placeholder: '请输入新密码（至少6位）',
        allowClear: true,
      },
    },
    {
      fieldName: 'cConfirmPwd',
      label: '确认密码',
      component: 'InputPassword',
      defaultValue: '',
      rules: z.preprocess((val) => val ?? '', z.string().min(1, '请确认新密码')),
      componentProps: {
        placeholder: '请再次输入新密码',
        allowClear: true,
      },
      dependencies: {
        rules: (values) => {
          return z.preprocess(
            (val) => val ?? '',
            z.string().refine((val) => val === values.cNewPwd, {
              message: '两次密码输入不一致',
            }),
          );
        },
      },
    },
  ],
  commonConfig: {
    labelWidth: 100,
  },
  showDefaultActions: false,
});

/**
 * 打开弹窗
 */
const open = () => {
  formApi.resetForm();
  visible.value = true;
};

/**
 * 关闭弹窗
 */
const close = () => {
  visible.value = false;
  formApi.resetForm();
};

/**
 * 确认提交
 */
const handleOk = async () => {
  try {
    // 校验表单
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }

    const values = await formApi.getValues();
    loading.value = true;

    // 调用接口
    const res = await requestClient.post('/core/authUser/updatePwd', {
      cUsernumb: userStore.code,
      cOldPwd: values.cOldPwd,
      cNewPwd: values.cNewPwd,
      cConfirmPwd: values.cConfirmPwd,
    });

    if (res.code === 200) {
      Message.success('密码修改成功');
      close();
    } else {
      Message.error(res.message || '密码修改失败');
    }
  } catch (error) {
    console.error('[PasswordModal] 修改密码失败:', error);
  } finally {
    loading.value = false;
  }
};

/**
 * 取消
 */
const handleCancel = () => {
  close();
};

// 暴露方法
defineExpose({
  open,
  close,
});
</script>
