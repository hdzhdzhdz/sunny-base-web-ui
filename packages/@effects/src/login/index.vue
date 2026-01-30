<template>
  <div class="login-container">
    <div class="bg-01" :style="{ backgroundImage: `url(${bg01})` }" />
    <img class="bg-02" :src="bg02" alt="bg">
    <div class="d-01" />
    <div class="d-02" />

    <img class="logo" :src="logo" alt="logo">

    <div class="slogen">
      <img class="slogen-img" :src="slogen01" alt="slogen">
      <img class="slogen-img" :src="slogen02" alt="slogen">
      <img class="slogen-img" :src="slogen03" alt="slogen">
    </div>

    <div class="form-panel">
      <a-form ref="loginFormRef" :model="loginForm" layout="vertical">
        <a-form-item field="username" :rules="[{ required: true, message: $t('请输入账号') }]" hide-label>
          <a-input 
            v-model="loginForm.username" 
            tabindex="1" 
            :placeholder="$t('请输入账号')"
            @focus="activeInput = 0" 
            @blur="activeInput = -1" 
            allow-clear
          >
            <template #prefix>
              <div class="input-icon-wrapper" :class="{active: activeInput === 0}">
                <icon-user />
              </div>
            </template>
          </a-input>
        </a-form-item>
        <a-form-item field="password" :rules="[{ required: true, message: $t('请输入密码') }]" hide-label>
          <a-input-password
            ref="pwdInputRef"
            v-model="loginForm.password"
            tabindex="2"
            :placeholder="$t('请输入密码')"
            @focus="activeInput = 1" 
            @blur="activeInput = -1" 
            allow-clear
          >
            <template #prefix>
              <div class="input-icon-wrapper" :class="{active: activeInput === 1}">
                <icon-lock />
              </div>
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item hide-label>
          <a-select
            v-model="language"
            :placeholder="$t('请选择语言')"
            style="width: 100%"
            @change="handleSetLanguage"
            @focus="activeInput = 2"
            @blur="activeInput = -1"
          >
            <template #prefix>
              <div class="input-icon-wrapper" :class="{active: activeInput === 2}">
                <icon-language />
              </div>
            </template>
            <a-option
              v-for="item in langList"
              :key="item.id"
              :label="item.cName"
              :value="item.cXuhao"
            />
          </a-select>
        </a-form-item>
        <a-form-item v-if="hideMac" hide-label>
          <a-input 
            v-model="loginForm.macAddress" 
            readonly 
            :placeholder="$t('MAC地址')"
            @focus="activeInput = 3" 
            @blur="activeInput = -1"
          >
             <template #prefix>
              <div class="input-icon-wrapper" :class="{active: activeInput === 3}">
                <icon-desktop />
              </div>
            </template>
          </a-input>
        </a-form-item>
        <a-form-item style="position: relative">
          <!-- 自定义滑动验证浮层 -->
          <div v-if="visible" class="verify-popover" ref="verifyPopoverRef">
            <slide-verify
              v-if="refreshShow"
              :l="42"
              :r="10"
              :w="310"
              :h="155"
              :slider-text="sliderText"
              :imgs="slideImgs"
              @success="onSuccess"
              @fail="onFail"
              @again="onRefresh"
            ></slide-verify>
          </div>

          <a-button
            type="primary"
            style="width: 100%"
            :loading="loading"
            :disabled="visible"
            @click.stop="handleLogin"
          >{{ $t('登录') }}</a-button>
        </a-form-item>
      </a-form>
      
      <div class="login-tips">
        <div v-if="hideMac">
          {{ $t('如果您无法获取到MAC地址，请先下载并安装插件') }}：
          <a :href="`${SSO_ORIGIN}/sunnyoptical_getmac.exe`">{{ $t('下载地址1') }}</a>&nbsp;
          <a :href="`${SSO_ORIGIN}/CLodop_Setup_for_Win32NT.exe`">{{ $t('下载地址2') }}</a>
          <br>
        </div>
        <div v-if="ssoUrl">
          {{ $t('公司内部人员另外登录途径') }}：<a :href="`${SSO_ORIGIN}/login?service=${ssoUrl}`">{{ $t('单点登录') }}</a>
        </div>
      </div>
    </div>

    <div class="copyright">SUNNY SINGLE SIGN-ON PLATFORM◎ 2023 · SUNNY OPTICAL TECHNOLOGY(GROUP)CO.,LTD</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconUser, IconLock, IconLanguage, IconDesktop } from '@arco-design/web-vue/es/icon'
import { getLodop } from './utils/LodopFuncs'
import { getRsaData } from '../utils/encryption'
import { login } from '../api/user'
import { useAccessStore, useUserStore } from '@sunny-base-web/stores'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import SlideVerify from 'vue3-slide-verify'
import 'vue3-slide-verify/dist/style.css'
import { getEnterStrategy } from '../api/core'
import axios from 'axios'
import { SSO_ORIGIN } from '@config/constants'
// Import images
import bg01Img from './imgs/bg_01.png'
import bg02Img from './imgs/bg_02.png'
import logoImg from './imgs/logo_01.png'
import slogen01Img from './imgs/slogen_01.png'
import slogen02Img from './imgs/slogen_02.png'
import slogen03Img from './imgs/slogen_03.png'
import slideBg1 from './slideBg/bg1.png'
import slideBg2 from './slideBg/bg2.png'
import slideBg3 from './slideBg/bg3.png'
import slideBg4 from './slideBg/bg4.png'
import slideBg5 from './slideBg/bg5.png'
import slideBg6 from './slideBg/bg6.png'
import slideBg7 from './slideBg/bg7.png'

// Mock APIs or imports
// import { queryByXuhao, getEnterStrategy, getSlideVerificationCode } from '@/api/core'
// import { getLodop } from '@/utils/LodopFuncs'

// Define props for images to allow generalization
const props = defineProps({
  bg01: { type: String, default: bg01Img },
  bg02: { type: String, default: bg02Img },
  logo: { type: String, default: logoImg },
  slogen01: { type: String, default: slogen01Img },
  slogen02: { type: String, default: slogen02Img },
  slogen03: { type: String, default: slogen03Img },
  ssoUrl: { type: String, default: '' },
})

const emit = defineEmits(['login'])

const { t, locale } = useI18n()

// State
const loginFormRef = ref()
const pwdInputRef = ref()
const showPassword = ref(false)
const loginForm = reactive({
  username: '',
  password: '',
  langList: '',
  macAddress: ''
})
const macList = ref<string[]>([])
const langList = ref<any[]>([])
const loading = ref(false)
const redirect = ref<string | undefined>(undefined)
const activeInput = ref(-1)
const visible = ref(false)
const verifyPopoverRef = ref()
const loginStrategy = ref('') // 登录策略(single/slide/mac)
const refreshShow = ref(true)

// Computed
// Assuming store is available or mocked
// const store = useStore() 
// const language = computed(() => store.getters.language)
const language = ref('zh-CN') // Mock

const hideMac = computed(() => !['slide', 'single'].includes(loginStrategy.value))
const sliderText = computed(() => `${t('向右滑动')}(${(loginForm as any).cVerificationCode || ''})`)

// Watch
// const route = useRoute()
// watch(() => route, (newRoute) => {
//   redirect.value = newRoute.query?.redirect as string
// }, { immediate: true })

// Methods
const handleSetLanguage = (val: any) => {
  language.value = val
  locale.value = val
  // store.dispatch('app/setLanguage', lang)
  sessionStorage.removeItem('langObj')
  window.location.reload()
}

/**
 * 初始化背景装饰线条动画
 * 1. 监听窗口 resize 事件，动态计算并调整线条旋转角度以适应屏幕比例
 * 2. 开启定时器（8秒/轮），控制线条 (.d-01, .d-02) 进行周期性的位移和透明度变化动画
 */
const initLineAction = () => {
  const oD1 = document.querySelector('.d-01') as HTMLElement
  const oD2 = document.querySelector('.d-02') as HTMLElement
  if (!oD1 || !oD2) return

  window.onresize = () => {
    const w = document.body.clientWidth
    const h = document.body.clientHeight
    const k = 26 / (1366 / 657)

    const degNum = (w / h) * k
    oD1.style.transform = `rotate(${degNum}deg)`
    oD2.style.transform = `rotate(${degNum}deg)`
  }

  setInterval(() => {
    oD1.style.transition = '.6s'
    oD1.style.left = '22.3%'
    oD1.style.top = '98%'

    oD2.style.transition = '.6s'
    oD2.style.left = '95.3%'
    oD2.style.top = '-18%'

    setTimeout(() => {
      oD1.style.transition = '0s'
      oD1.style.opacity = '0'

      oD2.style.transition = '0s'
      oD2.style.opacity = '0'
    }, 600)
    setTimeout(() => {
      oD1.style.transition = '0s'
      oD1.style.left = '50.3%'
      oD1.style.top = '-18%'

      oD2.style.transition = '0s'
      oD2.style.left = '67.3%'
      oD2.style.top = '98%'
    }, 650)

    setTimeout(() => {
      oD1.style.opacity = '1'
      oD2.style.opacity = '1'
    }, 7900)
  }, 8000)
}

/**
 * 初始化 Slogan 标语轮播动画
 * 开启定时器（8秒/轮），通过 CSS3 transform: rotateX 实现图片的 3D 翻转切换效果
 */
const initSlogenAction = () => {
  const oSlogenList = document.querySelectorAll('.slogen-img')
  let index = 0
  setInterval(() => {
    if (index === 2) {
      index = -1
    }
    index++
    const cur = oSlogenList[index] as HTMLElement
    const prev = oSlogenList[index === 0 ? 2 : index - 1] as HTMLElement

    if (prev) prev.style.transform = 'rotateX(-90deg)'
    setTimeout(() => {
      if (prev) {
        prev.style.transition = '0s'
        prev.style.transform = 'rotateX(90deg)'
      }
      if (cur) cur.style.transform = 'rotateX(0deg)'
    }, 400)

    setTimeout(() => {
      if (prev) prev.style.transition = '.4s ease-in'
    }, 800)
  }, 8000)
}

// Mock APIs
const queryByXuhao = async (params: any) => {
  return { result: [{ id: 1, cName: '中文', cXuhao: 'zh-CN' }, { id: 2, cName: 'English', cXuhao: 'en-US' }] }
}

const getSlideVerificationCode = async (params: any) => {
  return { code: 200, result: { verificationCode: '1234' } }
}

const initLoginType = () => {
  getEnterStrategy().then(res => {
    loginStrategy.value = res.result.loginStrategy
    if (loginStrategy.value !== 'slide') {
      // Mock Mac address logic
      if (systemType() === 'mac') {
        getMacAddressInMac()
      } else {
        getMacAddress()
      }
    }
  })
}

// 获取系统类型
const systemType = () => {
  var agent = navigator.userAgent.toLowerCase();
  var isMac = /macintosh|mac os x/i.test(navigator.userAgent);
  if (agent.indexOf("win32") >= 0 || agent.indexOf("wow32") >= 0) {
    return "win32";
  }
  if (agent.indexOf("win64") >= 0 || agent.indexOf("wow64") >= 0) {
    return "win64";
  }
  if (isMac) {
    return "mac";
  }
}

// mac系统获取mac地址
const getMacAddressInMac = () => {
  const p1 = new Promise((resolve, reject) => {
    axios
      .post(`http://127.0.0.1:19101`)
      .then((response) => {
        console.log("1", response);
        const res = response.data;
        resolve([res]);
      })
      .catch((error) => {
        reject(error);
      });
  });

  const p2 = new Promise((resolve, reject) => {
    axios
      .post(`http://127.0.0.1:29101`)
      .then((response) => {
        console.log("2", response);
        const res = response.data;
        resolve([res]);
      })
      .catch((error) => {
        reject(error);
      });
  });

  Promise.any([p1, p2])
    .then((result: any) => {
      macList.value = result;
      loginForm.macAddress = result.join(",");
    })
    .catch(() => {
      console.log("mac 获取失败");
    });
}



// 获取mac地址
const getSystemInfo = (strINFOType: string) => {
  let LODOP: any // 声明为全局变量
  try {
    LODOP = getLodop()
  } catch (e) {
    console.log(e)
  }
  if (LODOP?.CVERSION) {
    // eslint-disable-next-line no-undef
    ;(window as any).CLODOP.On_Return = function(TaskID: string, Value: string) {
      x(Value.replace(/-/g, ':'))
    }
    LODOP.GET_SYSTEM_INFO(strINFOType)
  }
}

const x = (num: any) => {
  if (!num) { return }
  if (Number(num) > 0) {
    macTotal.value = Number(num)
    for (let i = Number(num); i > 0; i--) {
      getSystemInfo('NetworkAdapter.' + i + '.PhysicalAddress')
    }
  } else {
    getSystemInfo('NetworkAdapter.' + num + '.PhysicalAddress')
    macList.value.push(num)
    loginForm.macAddress = macList.value.join(',')
  }
}

const getMacAddress = () => {
  const p1 = new Promise((resolve, reject) => {
    axios.get(`http://localhost:19101/getmac?select=c2VsZWN0ICogZnJvbSBXaW4zMl9OZXR3b3JrQWRhcHRlcg==`)
      .then((response) => {
        const res = response.data
        if (systemType() === 'mac') {
          resolve(res)
        } else if (res.Code == 0) {
          const list = res.Win32_NetworkAdapter.map((n: any) => n.MACAddress).filter((el: any) => !!el)
          resolve(list)
        } else {
          reject(response)
        }
      })
      .catch((error) => {
        reject(error)
      })
  })

  const p2 = new Promise((resolve, reject) => {
    axios.get(`http://localhost:29101/getmac?select=c2VsZWN0ICogZnJvbSBXaW4zMl9OZXR3b3JrQWRhcHRlcg==`)
      .then((response) => {
        const res = response.data
        if (systemType() === 'mac') {
          resolve(res)
        } else if (res.Code == 0) {
          const list = res.Win32_NetworkAdapter.map((n: any) => n.MACAddress).filter((el: any) => !!el)
          resolve(list)
        } else {
          reject(response)
        }
      })
      .catch((error) => {
        reject(error)
      })
  })

  const p3 = new Promise((resolve, reject) => {
    axios.get(`https://localhost:19102/getmac?select=c2VsZWN0ICogZnJvbSBXaW4zMl9OZXR3b3JrQWRhcHRlcg==`)
      .then((response) => {
        const res = response.data
        if (systemType() === 'mac') {
          resolve(res)
        } else if (res.Code == 0) {
          const list = res.Win32_NetworkAdapter.map((n: any) => n.MACAddress).filter((el: any) => !!el)
          resolve(list)
        } else {
          reject(response)
        }
      })
      .catch((error) => {
        reject(error)
      })
  })

  const p4 = new Promise((resolve, reject) => {
    axios.get(`https://localhost:29102/getmac?select=c2VsZWN0ICogZnJvbSBXaW4zMl9OZXR3b3JrQWRhcHRlcg==`)
      .then((response) => {
        const res = response.data
        if (systemType() === 'mac') {
          resolve(res)
        } else if (res.Code == 0) {
          const list = res.Win32_NetworkAdapter.map((n: any) => n.MACAddress).filter((el: any) => !!el)
          resolve(list)
        } else {
          reject(response)
        }
      })
      .catch((error) => {
        reject(error)
      })
  })

  Promise.any([p1, p2, p3, p4]).then((result: any) => {
    macList.value = result
    loginForm.macAddress = result.join(',')
  }).catch(() => {
    // 如果失败，走lodop方式
    let lodop: any
    const interval = setInterval(() => {
      try {
        lodop = getLodop()
      } catch (e) {}
      if (lodop) {
        getSystemInfo('NetworkAdapter.Count')
        clearInterval(interval)
      }
    }, 500)
  })
}

const handleLogin = async () => {
  if (!loginForm.username) {
    Message.warning(t('请输入账号'))
    return
  }
  if (!loginForm.password) {
    Message.warning(t('请输入密码'))
    return
  }
  if (loginStrategy.value === 'mac' && !loginForm.macAddress) {
    Message.warning(t('未获取到Mac地址'))
    return
  }

  const errors = await loginFormRef.value?.validate()
  if (!errors) {
    if (loginStrategy.value === 'slide') {
       onRefresh().then(() => {
          console.log('Opening slide verify')
          visible.value = true
       })
    } else {
      loginAction()
    }
  }
}



// const router = useRouter()
const accessStore = useAccessStore()
const userStore = useUserStore()

const loginAction = async () => {
  loading.value = true
  try {
    const { username, password, macAddress, cVerificationCode, systemSign } = loginForm
    const res = await login({
      username: username.trim(),
      password: getRsaData(password),
      macAddress: macAddress,
      cVerificationCode: cVerificationCode,
      systemSign: getRsaData(systemSign) ? getRsaData(systemSign) : ''
    })
    
    if (res.code === 0 || res.success) {
       const token = res.result?.token || (res.result as any)
       accessStore.setAccessToken(token)
       Message.success(t('登录成功'))
       // 可以选择在这里获取用户信息，或者在路由守卫中获取
       // await userStore.fetchUserInfo()
      //  router.push('/')
    } else {
       // 错误处理通常由拦截器处理，但如果需要特定处理可以写在这里
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const onRefresh = () => {
  return new Promise<void>((resolve, reject) => {
    getSlideVerificationCode({ "usernumb": loginForm.username }).then(res => {
      if (res.code === 200) {
        // Vue 3 reactive update
        (loginForm as any).cVerificationCode = res.result.verificationCode
        resolve()
      } else {
        refreshShow.value = false
        setTimeout(() => {
          refreshShow.value = true
        }, 5000)
        reject(new Error('error'))
      }
    }).catch(err => {
      refreshShow.value = false
      setTimeout(() => {
        refreshShow.value = true
      }, 5000)
      reject(err)
    })
  })
}

const slideImgs = [slideBg1, slideBg2, slideBg3, slideBg4, slideBg5, slideBg6, slideBg7]

const onSuccess = () => {
  visible.value = false
  loginAction()
}

const onFail = () => {
  Message.error(t('验证失败'))
}

const handleClickOutside = (e: MouseEvent) => {
  if (visible.value && verifyPopoverRef.value && !verifyPopoverRef.value.contains(e.target as Node)) {
    visible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  initLineAction()
  initSlogenAction()
  initLoginType()

  queryByXuhao({ cXuhao: 'LANG' }).then(res => {
    langList.value = res.result
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

// Simple Black/White Input Style
:deep(.arco-input-wrapper), :deep(.arco-select-view-single) {
  background-color: #fff; // Solid white
  border: 1px solid #dcdfe6; // Standard gray border
  border-radius: 4px;
  height: 5vh;
  color: #333; // Black text
  transition: all 0.3s;
  padding-left: 12px;

  &:hover {
    background-color: #fff; // Force white on hover
    border-color: #409eff; // Highlight color
  }

  &:focus-within {
    background-color: #fff; // Force white on focus
    border-color: #409eff; // Highlight color
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2); // Add subtle focus glow
  }

  .arco-input {
    color: #333; // Input text black
    &::placeholder {
      color: #999;
    }
  }
}

// Icon wrapper
.input-icon-wrapper {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  :deep(.arco-icon) {
    font-size: 18px;
    color: #000;
    opacity: 0.6;
  }
}

:deep(.arco-btn-primary) {
  background-color: #409eff;
  border-color: #409eff;
  height: 5vh;
  font-size: 1.2vw;
  font-weight: bold;
  
  &:hover {
    background-color: #66b1ff;
    border-color: #66b1ff;
  }
}

.login-container {
  width: 100vw;
  height: 100vh;
  background: rgb(40, 81, 175);
  position: relative;
  overflow: hidden;

  .bg-01 {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 1;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-attachment: fixed;
  }

  .bg-02 {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 4%;
    top: 0;
    z-index: 2;
  }

  .d-01 {
    position: absolute;
    left: 50.3%;
    top: -18%;
    z-index: 3;
    transform: rotate(26deg);
    width: 4px;
    height: 20%;
    background: #ffffffcc;
  }

  .d-02 {
    position: absolute;
    left: 67.3%;
    top: 98%;
    z-index: 3;
    transform: rotate(26deg);
    width: 4px;
    height: 20%;
    background: #ffffffcc;
  }

  .logo {
    position: absolute;
    width: 19%;
    height: 7%;
    left: 6%;
    top: 28%;
    z-index: 4;
  }

  .slogen {
    position: absolute;
    width: 42%;
    height: 18%;
    left: 6%;
    top: 38%;
    z-index: 4;

    .slogen-img {
      &:first-child {
        transform: rotateX(0);
      }
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      max-height: 100%;
      transition: .4s ease-in;
      transform: rotateX(90deg);
    }
  }

  .form-panel {
    position: absolute;
    left: 70%;
    top: 50%;
    transform: translateY(-55%);
    width: 22%;
    z-index: 4;

    .login-tips {
      margin-top: 10px;
      padding-left: 0;
      font-size: 1vw;
      color: #fff;
      text-align: center;

      a {
        color: #409eff;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .copyright {
    position: absolute;
    left: 50%;
    bottom: 3%;
    transform: translateX(-50%);
    z-index: 4;
    font-size: 12px;
    color: #fff;
  }
}

.verify-popover {
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  width: 330px;
  padding: 10px;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  z-index: 999;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background-color: #fff;
  }
}
</style>
