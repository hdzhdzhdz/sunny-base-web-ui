import { reactive, toRefs, ref } from 'vue'
import selectOption from '../../../utils/select-options'
import { saveMenu } from '../../../api/resource'
import { find, hasIn, isEmpty } from 'lodash-es'
import { useSunnyForm } from '@sunny-base-web/ui';
import { Modal, Message } from '@arco-design/web-vue';

export const useModuleEditor = (emits) => {
  const formInstance = ref()
  const tabMetaEditor = ref()
  const formTabsMetaEditor = ref()
  const dialogData = reactive({
    visible: false,
    data: {},
    type: 0, // 0新增资源 1编辑资源
    confirmLoading: false,
    formFields: [
      {
        component: 'Input',
        label: '模块编号',
        fieldName: 'cModnumb',
        disabled: true,
        colProps: { span: 24 },
        dependencies: {
          show: (values) => !values.cModnumb === false
        }
      },
      {
        component: 'Input',
        label: '模块名称',
        fieldName: 'cModname',
        rules: 'required',
        componentProps: {
          allowClear: true,
        }
      },
      {
        component: 'Select',
        label: '模块类型',
        fieldName: 'cType',
        rules: 'required',
        componentProps: {
          allowClear: true,
          options: selectOption.menuType
        }
      },
      {
        component: 'Input',
        label: '路由地址',
        fieldName: 'cUrl',
        componentProps: {
          allowClear: true,
          placeholder: '必须是/开头的全路径'
        },
        dependencies: {
          required: (values) => values.cType === '1',
        }
      },
      {
        component: 'Slot',
        label: '组件路径',
        fieldName: 'cViewpath',
        componentProps: {
          allowClear: true,
          options: [
            { label: `Layout`, value: `Layout` },
            { label: `Second`, value: `Second` }
          ]
        },
        dependencies: {
          required: (values) => values.cType === '1',
        }
      },
      {
        component: 'Select',
        label: '模板类型',
        fieldName: 'cTemplatetype',
        componentProps: {
          allowClear: true,
          options: selectOption.templateList,
          onChange: async (val) => {
            const formModel = await formApi.getValues()
            if ((val === '1' || val === '4') && !formModel.cMeta) {
              const meta = find(selectOption.templateList, ['value', val])?.defaultMeta
              formApi.setValues({ 'cMeta': meta }, false)
            }
          },
        }
      },
      {
        component: 'Select',
        label: '查询列宽',
        fieldName: 'nSearchformlg',
        componentProps: {
          allowClear: true,
          options: selectOption.searchFormLg
        }
      },
      {
        component: 'Input',
        label: '图标',
        fieldName: 'cIcon',
      },
      {
        component: 'Input',
        label: 'Name',
        fieldName: 'cViewname',
        componentProps: {
          placeholder: '用于页面缓存,需与组件名一致',
          allowClear: true
        }
      },
      {
        component: 'Textarea',
        label: '模块描述',
        fieldName: 'cModdesc',
        componentProps: {
          allowClear: true,
          autoSize: {
            minRows: 1, maxRows: 5
          }
        }
      },
      {
        component: 'InputNumber',
        label: '排序',
        fieldName: 'nOrder',
        componentProps: {
          min: 0
        }
      },
      {
        component: 'Switch',
        label: '是否显示',
        fieldName: 'cShow',
        componentProps: {
          uncheckedValue: '1',
          checkedValue: '0',
        },
        colProps: { span: 6 },
      },
      {
        component: 'Switch',
        label: '是否禁用',
        fieldName: 'cSign',
        componentProps: {
          uncheckedValue: '1',
          checkedValue: '0',
        },
        colProps: { span: 6 },
      },
      {
        component: 'Switch',
        label: '是否敏感',
        fieldName: 'nSensitive',
        componentProps: {
          uncheckedValue: '0',
          checkedValue: '1',
        },
        colProps: { span: 6 },
      },
      {
        component: 'Switch',
        label: '角色权限',
        fieldName: 'cAuth',
        componentProps: {
          uncheckedValue: '0',
          checkedValue: '1',
        },
        colProps: { span: 6 },
        dependencies: {
          required: (values) => values.cType === '1',
        }
      },
      {
        component: 'Slot',
        label: 'Meta',
        fieldName: 'cMeta',
        placeholder: '自定义额外数据',
        allowClear: true,
        colProps: { span: 24 },
      }
    ],
    rules: {
      cModname: [{ required: true, message: '请填写模块名称', trigger: 'change' }],
      cType: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
      cAuth: [
        {
          validator: (rule, value, callback) => {
            if (dialogData.data.cType === '1' && value !== '1') {
              callback(new Error('菜单必须校验权限'))
            }
          },
          trigger: 'change'
        }
      ],
      cUrl: [
        {
          validator: (rule, value, callback) => {
            if (dialogData.data.cType === '1' && !value) {
              callback(new Error('菜单必须填写路由地址'))
            }
          },
          trigger: 'change'
        }
      ],
      cViewpath: [
        {
          validator: (rule, value, callback) => {
            if (dialogData.data.cType === '1' && !value) {
              callback(new Error('菜单必须填写组件路径'))
            }
          },
          trigger: 'change'
        }
      ]
    },
  })

  const [Form, formApi] = useSunnyForm({
    layout: 'horizontal',
    showDefaultActions: false,
    labelWidth: 90,
    // 栅格容器配置 (a-grid props)
    gridProps: {
      xGap: 0,
      yGap: 0,
    },
    // 表单项通用配置
    commonConfig: {
      // 响应式栅格配置
      colProps: {
        xs: 12, // < 576px
        sm: 12, // >= 576px
        md: 12,  // >= 768px
        lg: 12,  // >= 992px
      },
    },
    // 基础数据
    values: {},
    schema: dialogData.formFields,
    // handleSubmit: (values) => {
    //   Message.success('提交: ' + JSON.stringify(values));
    // },
  });

  // 打开编辑器
  const openEditor = ({ type = 0, data }) => {
    dialogData.type = type // 编辑框类型
    dialogData.data = data // 编辑框内容 会传入父级id 编辑信息
    formApi.setValues(data, false) // 给表单设默认值,设置第二个参数为false,不过滤字段
    dialogData.visible = true // open
  }
  const handleNodefileOk = (data) => {
    const { relativePath } = data
    dialogData.data.cViewpath = relativePath
  }
  const handleOk = async() => {
    const formValues = await formApi.getValues(); 
    const payload = { authResMenu: formValues }
    // 新增编辑公用接口
    saveMenu(payload).then(res => {
      if (res.success) {
        Message.success({
          closable: true,
          content: `保存成功!`,
        })
        // 调用成功后刷新父节点下子节点数据
        emits('save', formValues.nParkeyid)
        // 关闭弹窗
        dialogData.visible = false
      } else {
        Message.error({
          closable: true,
          content: `error:${res.message}`,
        })
      }
    })
  }
  // dialog 关闭时的回调
  const close = () => {
    dialogData.data = {}
    dialogData.type = 0
    dialogData.confirmLoading = false
  }
  return {
    ...toRefs(dialogData),
    formInstance,
    tabMetaEditor,
    formTabsMetaEditor,
    handleNodefileOk,
    openEditor,
    handleOk,
    close,
    Form,
    formApi
  }
}
