<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconSafe, IconMenu, IconRobot, IconSave } from '@arco-design/web-vue/es/icon'
import { findAllSettings, saveAllSettings } from './api'
import type { SystemSettingForm, WeakPasswordItem } from './types'

// ----------------------------------------------------------------------
// 状态定义
// ----------------------------------------------------------------------

const loading = ref(false)
const saving = ref(false)

const formData = reactive<SystemSettingForm>({
  initialPassword: '',
  weakPasswords: [],
  showSubMenuIcon: true,
  showAgent: false,
  agentUrl: '',
  agentToken: ''
})

const weakPasswordList = ref<WeakPasswordItem[]>([])
const newWeakPassword = ref('')
const showAgentConfig = computed(() => formData.showAgent)

// ----------------------------------------------------------------------
// 弱密码管理
// ----------------------------------------------------------------------

const handleAddWeakPassword = () => {
  const password = newWeakPassword.value.trim()
  if (!password) {
    Message.warning('请输入弱密码')
    return
  }
  if (weakPasswordList.value.some(item => item.password === password)) {
    Message.warning('该弱密码已存在')
    return
  }
  weakPasswordList.value.push({ id: Date.now().toString(), password })
  formData.weakPasswords = weakPasswordList.value.map(item => item.password)
  newWeakPassword.value = ''
}

const handleDeleteWeakPassword = (id: string) => {
  weakPasswordList.value = weakPasswordList.value.filter(item => item.id !== id)
  formData.weakPasswords = weakPasswordList.value.map(item => item.password)
}

// ----------------------------------------------------------------------
// 数据加载与保存
// ----------------------------------------------------------------------

const loadSettings = async () => {
  loading.value = true
  try {
    const response = await findAllSettings()
    const settings = response.result || []

    settings.forEach((item: any) => {
      switch (item.cNum) {
        case 'InitPwd':
          formData.initialPassword = item.cValue || ''
          break
        case 'PwdStrVal':
          try {
            const pwdConfig = JSON.parse(item.cValue || '{}')
            if (pwdConfig.list && Array.isArray(pwdConfig.list)) {
              weakPasswordList.value = pwdConfig.list.map((pwd: string, index: number) => ({
                id: String(index),
                password: pwd
              }))
              formData.weakPasswords = pwdConfig.list
            }
          } catch (e) {
            console.error('解析弱密码配置失败', e)
          }
          break
        case 'SubMenuIconShow':
          try {
            const menuConfig = JSON.parse(item.cValue || '{}')
            formData.showSubMenuIcon = menuConfig.show === menuConfig.activeValue || menuConfig.show === '1'
          } catch (e) {
            console.error('解析菜单图标配置失败', e)
          }
          break
        case 'ShowAgent':
          try {
            const agentConfig = JSON.parse(item.cValue || '{}')
            formData.showAgent = agentConfig.show === agentConfig.activeValue || agentConfig.show === '1'
            formData.agentUrl = agentConfig.agentUrl || ''
            formData.agentToken = agentConfig.token || ''
          } catch (e) {
            console.error('解析智能体配置失败', e)
          }
          break
      }
    })
  } catch (error) {
    Message.error('加载设置失败')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (formData.showAgent) {
    if (!formData.agentUrl.trim()) {
      Message.warning('请输入智能体地址')
      return
    }
    if (!formData.agentToken.trim()) {
      Message.warning('请输入智能体 Token')
      return
    }
  }

  saving.value = true
  try {
    const settings = [
      {
        cNum: 'InitPwd',
        cValue: formData.initialPassword
      },
      {
        cNum: 'PwdStrVal',
        cValue: JSON.stringify({
          enabled: true,
          list: formData.weakPasswords
        })
      },
      {
        cNum: 'SubMenuIconShow',
        cValue: JSON.stringify({
          show: formData.showSubMenuIcon ? '1' : '0',
          activeText: '显示',
          activeValue: '1',
          inactiveText: '不显示',
          inactiveValue: '0'
        })
      },
      {
        cNum: 'ShowAgent',
        cValue: JSON.stringify({
          show: formData.showAgent ? '1' : '0',
          activeText: '显示',
          activeValue: '1',
          inactiveText: '不显示',
          inactiveValue: '0',
          type: 'dify',
          token: formData.agentToken,
          agentUrl: formData.agentUrl
        })
      }
    ]

    await saveAllSettings(settings)
    Message.success('设置已保存')
  } catch (error) {
    Message.error('保存失败')
  } finally {
    saving.value = false
  }
}

loadSettings()
</script>

<template>
  <div class="h-full w-full overflow-auto bg-[var(--color-fill-2)]">
    <a-spin :loading="loading" class="h-full w-full">
      <div class="flex flex-col h-full w-full">
        <!-- 内容区域 -->
        <div class="flex-1 overflow-auto">
          <div class="space-y-4">
            <!-- 安全设置 -->
            <a-card title="安全设置" :bordered="false">
              <template #extra>
                <IconSafe class="text-[var(--color-text-4)]" />
              </template>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <!-- 初始密码 -->
                <div class="flex items-center gap-3">
                  <label class="shrink-0 w-20 text-sm text-[var(--color-text-2)]">初始密码</label>
                  <a-input-password
                    v-model="formData.initialPassword"
                    placeholder="新用户默认密码"
                    allow-clear
                    class="flex-1"
                  />
                </div>

                <!-- 弱密码 -->
                <div class="flex items-start gap-3">
                  <label class="shrink-0 w-20 pt-1.5 text-sm text-[var(--color-text-2)]">弱密码校验</label>
                  <div class="flex-1">
                    <div class="flex gap-2">
                      <a-input
                        v-model="newWeakPassword"
                        placeholder="添加禁止密码"
                        allow-clear
                        size="small"
                        @press-enter="handleAddWeakPassword"
                      />
                      <a-button type="primary" size="small" @click="handleAddWeakPassword">
                        <IconPlus />
                      </a-button>
                    </div>
                    <div v-if="weakPasswordList.length > 0" class="flex flex-wrap gap-1.5 mt-2">
                      <a-tag
                        v-for="item in weakPasswordList"
                        :key="item.id"
                        closable
                        color="orangered"
                        size="small"
                        @close="handleDeleteWeakPassword(item.id)"
                      >
                        {{ item.password }}
                      </a-tag>
                    </div>
                  </div>
                </div>
              </div>
            </a-card>

            <!-- 界面设置 & 智能体配置 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <!-- 智能体配置 -->
              <a-card title="智能体配置" :bordered="false">
                <template #extra>
                  <IconRobot class="text-[var(--color-text-4)]" />
                </template>

                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm text-[var(--color-text-1)]">启用智能体</div>
                    <div class="text-xs text-[var(--color-text-4)] mt-0.5">启用后可在系统中使用 AI 智能体</div>
                  </div>
                  <a-switch v-model="formData.showAgent" />
                </div>

                <transition name="expand">
                  <div v-if="showAgentConfig" class="mt-4 pt-4 border-t border-[var(--color-border-1)] space-y-3">
                    <div class="flex items-center gap-3">
                      <label class="shrink-0 w-20 text-sm text-[var(--color-text-2)]">服务地址</label>
                      <a-input
                        v-model="formData.agentUrl"
                        placeholder="https://api.example.com"
                        allow-clear
                        class="flex-1"
                      />
                    </div>
                    <div class="flex items-center gap-3">
                      <label class="shrink-0 w-20 text-sm text-[var(--color-text-2)]">Token</label>
                      <a-input-password
                        v-model="formData.agentToken"
                        placeholder="访问令牌"
                        allow-clear
                        class="flex-1"
                      />
                    </div>
                  </div>
                </transition>
              </a-card>

              <!-- 界面设置 -->
              <a-card title="界面设置" :bordered="false">
                <template #extra>
                  <IconMenu class="text-[var(--color-text-4)]" />
                </template>

                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm text-[var(--color-text-1)]">子级菜单图标</div>
                    <div class="text-xs text-[var(--color-text-4)] mt-0.5">控制侧边栏子菜单是否显示图标</div>
                  </div>
                  <a-switch v-model="formData.showSubMenuIcon" />
                </div>
              </a-card>
            </div>
          </div>
        </div>

        <!-- 底部保存按钮 -->
        <div class="shrink-0 p-2 bg-[var(--color-bg-2)] border-t border-[var(--color-border-1)]">
          <div class="flex justify-end">
            <a-button type="primary" :loading="saving" @click="handleSave">
              <template #icon><IconSave /></template>
              保存设置
            </a-button>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 200px;
}
</style>
