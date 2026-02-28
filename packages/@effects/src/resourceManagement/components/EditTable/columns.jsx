import selectOpts from '../../../utils/select-options'
import { concat, find } from 'lodash-es'
import { SunnyIcon } from "@sunny-base-web/ui";

/**
 * 根据选项key、list返回对应name
 * @param {*} optionlist
 */
const filterSelect = (val, optionlist) => {
  const target = find(optionlist, ['value', val])
  return target ? target.label : ''
}

const InputRender = {
  name: 'VxeInput',
  props: {
    clearable: true,
  }
};
const SelectRender = {
  name: 'VxeSelect',
  props: {
    clearable: true,
  }
};
export default function() {
  const { type, area, datePickSetMeta, setDynamicJson, setDynamicI18n, pickTable, deleteRow, insertRow, metaEdit, setCallmethodsJson } = this
  let column = []
  const typeStr = type === 'Button' ? type : `${area}${type}`

  switch (typeStr) {
    case 'searchFormField':
      column = [
        {
          field: 'id',
          title: 'ID',
          width: '60',
        },
        {
          field: 'cArea',
          title: '所在区域',
          minWidth: '140',
          editRender: {},
          slots: {
            default: ({ row, column, rowIndex }) => {
              return [<span>{row[column.field]}</span>]
            },
            edit: ({ row, column, rowIndex }) => {
              return area ? [<span>{row[column.field]}</span>] : [<vxe-input v-model={row[column.field]} allow-clear />]
            }
          }
        },
        {
          field: 'cLabel',
          title: 'label',
          minWidth: '140',
          editRender: InputRender,
        },
        {
          field: 'cProp',
          title: 'prop',
          minWidth: '140',
          editRender: InputRender,
        },
        {
          field: 'cFieldtype',
          title: '字段组件类型',
          minWidth: '140',
          editRender: {
            ...SelectRender,
            options: selectOpts.FormFieldTypes,
            events: {
              change(cellParams, eventParams) {
                const { row, column, rowIndex } = cellParams;
                datePickSetMeta({ row, column }, find(selectOpts.FormFieldTypes, ['value', row[column.field]]))
              }
            }
          }
        },
        {
          field: 'cSeltype',
          title: '下拉类型',
          minWidth: '140',
          editRender: {
            ...SelectRender,
            options: selectOpts.selectType,
          }
        },
        {
          field: 'cSelval',
          title: '下拉选项数据对应key值',
          minWidth: '250',
          editRender: InputRender,
        },
        {
          field: 'cSign',
          title: '启用/禁用',
          minWidth: '140',
          editRender: {
            ...SelectRender,
            options: selectOpts.signOpts,
          }
        },
        {
          field: 'cShow',
          title: '显示/隐藏',
          minWidth: '140',
          editRender: {
            ...SelectRender,
            options: selectOpts.showOpts,
          }
        },
        {
          field: 'cDynamicShow',
          title: '自定义显示/隐藏',
          minWidth: '140',
          editRender: {},
          slots: {
            default: ({ row, column, rowIndex }) => {
              return [<span>{row[column.field]}</span>]
            },
            edit: ({ row, column, rowIndex }) => {
              return [<a-button size='mini' type='text' onClick={() => setDynamicJson({ row, rowIndex, column })} onKeyPress={() => { }}>编辑</a-button>]
            }
          }
        },
        {
          field: 'cDynamicRules',
          title: '自定义校验规则',
          minWidth: '140',
          editRender: {},
          slots: {
            default: ({ row, column, rowIndex }) => {
              return [<span>{row[column.field]}</span>]
            },
            edit: ({ row, rowIndex, column }) => {
              return [<a-button size='mini' type='text' onClick={() => setDynamicJson({ row, rowIndex, column })} onKeyPress={() => { }}>编辑</a-button>]
            }
          }
        },
        {
          field: 'cDynamicDisabled',
          title: '自定义启用/禁用',
          minWidth: '140',
          editRender: {},
          slots: {
            default: ({ row, column, rowIndex }) => {
              return [<span>{row[column.field]}</span>]
            },
            edit: ({ row, rowIndex, column }) => {
              return [<a-button size='mini' type='text' onClick={() => setDynamicJson({ row, rowIndex, column })} onKeyPress={() => { }}>编辑</a-button>]
            }
          }
        },
        {
          field: 'i18n',
          title: '国际化',
          minWidth: '140',
          editRender: {},
          slots: {
            default: ({ row, column, rowIndex }) => {
              return [<span>{row[column.field]}</span>]
            },
            edit: ({ row, column, rowIndex }) => {
              return [<a-button size='mini' type='text' onClick={() => setDynamicI18n({ row, rowIndex, column })} onKeyPress={() => { }}>编辑</a-button>]
            }
          }
        },
        {
          field: 'cAlign',
          title: '字段对齐方式',
          minWidth: '140',
          editRender: {
            ...SelectRender,
            options: selectOpts.alignOpts,
          }
        },
        {
          field: 'cWidth',
          title: '字段宽度',
          minWidth: '140',
          editRender: InputRender
        },
        {
          field: 'nLg',
          title: '栅格占比(lg)',
          minWidth: '100',
          editRender: InputRender
        },
        {
          field: 'cRequired',
          title: '是否校验',
          minWidth: '140',
          editRender: {
            ...SelectRender,
            options: selectOpts.requiredOpts,
          }
        },
        {
          field: 'cPlaceholder',
          title: '占位符',
          minWidth: '140',
          editRender: InputRender
        },
        {
          field: 'cSlot',
          title: '具名插槽name',
          minWidth: '140',
          editRender: InputRender
        },
        {
          field: 'cTip',
          title: '提示词',
          minWidth: '140',
          editRender: InputRender
        },
        {
          field: 'cEntityTable',
          title: '对应后端实体表名',
          minWidth: '160',
          editRender: {},
          slots: {
            default: ({ row, column, rowIndex }) => {
              return [<span>{row[column.field]}</span>]
            },
            edit: ({ row, column, rowIndex }) => {
              return [<a-button size='mini' type='text' onClick={() => pickTable({ 'selection': false, row, column, rowIndex })} onKeyPress={() => { }}>{row[column.field] ? row[column.field] : '选择'}</a-button>]
            }
          }
        },
        {
          field: 'cEntityCol',
          title: '对应后端实体表列名',
          minWidth: '160',
          editRender: {},
          slots: {
            default: ({ row, column, rowIndex }) => {
              return [<span>{row[column.field]}</span>]
            },
            edit: ({ row, column, rowIndex }) => {
              return [<a-button size='mini' type='text' onClick={() => pickTable({ 'selection': false, row, column, rowIndex })} onKeyPress={() => { }}>{row[column.field] ? row[column.field] : '选择'}</a-button>]
            }
          }
        },
        {
          field: 'action',
          title: '操作',
          fixed: 'right',
          width: '130',
          dragSort: true,
          slots: {
            default: ({ row, column, rowIndex }) => {
              return [
                <div class='flex items-center gap-1'>
                  <a-tooltip
                    content='删除'
                    mini={true}
                  >
                    <SunnyIcon
                      icon='lucide:x'
                      class="w-4 h-4 cursor-pointer outline-none"
                      onClick={() => deleteRow(rowIndex)}
                      onKeyPress={() => { }}
                    />
                  </a-tooltip>
                  <a-tooltip
                    content='额外参数'
                    mini={true}
                  >
                    <SunnyIcon
                      icon='lucide:more-horizontal'
                      class="w-4 h-4 cursor-pointer outline-none"
                      onClick={() => metaEdit({ row, rowIndex })}
                      onKeyPress={() => { }}
                    />
                  </a-tooltip>
                  <a-tooltip
                    content='插入行'
                    mini={true}
                  >
                    <SunnyIcon
                      icon="lucide:plus"
                      class="w-4 h-4 cursor-pointer outline-none"
                      onClick={() => insertRow({ rowIndex })}
                      onKeyPress={() => { }}
                    />
                  </a-tooltip>
                </div>
              ]
            }
          }
        }
      ]
      break
    case 'searchTableField':
      column = [
        {
          field: 'id',
          title: 'ID',
          width: '60'
        },
        {
          field: 'cArea',
          title: '所在区域',
          minWidth: '140',
          editRender: {},
          slots: {
            default: ({ row, column, rowIndex }) => {
              return [<span>{row[column.field]}</span>]
            },
            edit: ({ row, column, rowIndex }) => {
              return area ? [<span>{row[column.field]}</span>] : [<vxe-input v-model={row[column.field]} allow-clear />]
            }
          }
        },
        {
          field: 'cLabel',
          title: '列名',
          minWidth: '140',
          editRender: InputRender
        },
        {
          field: 'cProp',
          title: 'prop',
          minWidth: '140',
          editRender: InputRender
        },
        {
          field: 'cFieldtype',
          title: '表格字段类型',
          minWidth: '140',
          editRender: {
            ...SelectRender,
            options: selectOpts.TableFieldTypes,
            events: {
              change(cellParams, eventParams) {
                const { row, column, rowIndex } = cellParams;
                datePickSetMeta({ row, column }, find(selectOpts.FormFieldTypes, ['value', row[column.field]]))
              }
            }
          }
        },
        {
          field: 'cSeltype',
          title: '下拉类型',
          minWidth: '140',
          editRender: {
            ...SelectRender,
            options: selectOpts.selectType,
          }
        },
        {
          field: 'cSelval',
          title: '下拉选项数据对应key值',
          minWidth: '250',
          editRender: InputRender
        },
        {
          field: 'cShow',
          title: '显示/隐藏',
          minWidth: '140',
          editRender: {
            ...SelectRender,
            options: selectOpts.showOpts,
          }
        },
        {
          field: 'cWidth',
          title: '字段宽度',
          minWidth: '140',
          editRender: InputRender
        },
        {
          field: 'i18n',
          title: '国际化',
          minWidth: '140',
          editRender: {},
          slots: {
            default: ({ row, column, rowIndex }) => {
              return [<span>{row[column.field]}</span>]
            },
            edit: ({ row, column, rowIndex }) => {
              return [<a-button size='mini' type='text' onClick={() => setDynamicI18n({ row, rowIndex, column })} onKeyPress={() => { }}>编辑</a-button>]
            }
          }
        },
        {
          field: 'cEntityTable',
          title: '对应后端实体表名',
          minWidth: '160',
          editRender: {},
          slots: {
            default: ({ row, column, rowIndex }) => {
              return [<span>{row[column.field]}</span>]
            },
            edit: ({ row, column, rowIndex }) => {
              return [<a-button size='mini' type='text' onClick={() => pickTable({ 'selection': false, row, column, rowIndex })} onKeyPress={() => { }}>{row[column.field] ? row[column.field] : '选择'}</a-button>]
            }
          }
        },
        {
          field: 'cEntityCol',
          title: '对应后端实体表列名',
          minWidth: '160',
          editRender: {},
          slots: {
            default: ({ row, column, rowIndex }) => {
              return [<span>{row[column.field]}</span>]
            },
            edit: ({ row, column, rowIndex }) => {
              return [<a-button size='mini' type='text' onClick={() => pickTable({ 'selection': false, row, column, rowIndex })} onKeyPress={() => { }}>{row[column.field] ? row[column.field] : '选择'}</a-button>]
            }
          }
        },
        {
          field: 'nBill',
          title: '是否操作日志字段',
          minWidth: '160',
          editRender: {
            ...SelectRender,
            options: selectOpts.nBillOpts,
          }
        },
        {
          field: 'action',
          title: '操作',
          fixed: 'right',
          width: '130',
          dragSort: true,
          slots: {
            default: ({ row, column, rowIndex }) => {
              return [
                <div class='flex items-center gap-1'>
                  <a-tooltip
                    content='删除'
                    mini={true}
                  >
                    <SunnyIcon
                      icon='lucide:x'
                      class="w-4 h-4 cursor-pointer outline-none"
                      onClick={() => deleteRow(rowIndex)}
                      onKeyPress={() => { }}
                    />
                  </a-tooltip>
                </div>
              ]
            }
          }
        }
      ]
      break
    default:
      if (type === 'Field') {
        column = [
          {
            field: 'id',
            title: 'ID',
            width: '60'
          },
          {
            field: 'cArea',
            title: '所在区域',
            minWidth: '140',
            editRender: {},
            slots: {
              default: ({ row, column, rowIndex }) => {
                return [<span>{row[column.field]}</span>]
              },
              edit: ({ row, column, rowIndex }) => {
                return area ? [<span>{row[column.field]}</span>] : [<vxe-input v-model={row[column.field]} allow-clear />]
              }
            }
          },
          {
            field: 'cLabel',
            title: 'label',
            minWidth: '140',
            editRender: InputRender
          },
          {
            field: 'cProp',
            title: 'prop',
            minWidth: '140',
            editRender: InputRender
          },
          {
            field: 'cFieldtype',
            title: '字段组件类型',
            minWidth: '140',
            editRender: {
              ...SelectRender,
              options: [...selectOpts.FormFieldTypes, ...selectOpts.TableFieldTypes],
              events: {
                change(cellParams, eventParams) {
                  const { row, column, rowIndex } = cellParams;
                  datePickSetMeta({ row, column }, find(selectOpts.FormFieldTypes, ['value', row[column.field]]))
                }
              }
            }
          },
          {
            field: 'cSeltype',
            title: '下拉类型',
            minWidth: '140',
            editRender: {
              ...SelectRender,
              options: selectOpts.selectType,
            }
          },
          {
            field: 'cSelval',
            title: '下拉选项数据对应key值',
            minWidth: '250',
            editRender: InputRender
          },
          {
            field: 'cDefVal',
            title: '默认值',
            minWidth: '140',
            editRender: InputRender
          },
          {
            field: 'cSign',
            title: '启用/禁用',
            minWidth: '140',
            editRender: {
              ...SelectRender,
              options: selectOpts.signOpts,
            }
          },
          {
            field: 'cShow',
            title: '显示/隐藏',
            minWidth: '140',
            editRender: {
              ...SelectRender,
              options: selectOpts.showOpts,
            }
          },
          {
            field: 'cDynamicShow',
            title: '自定义显示/隐藏',
            minWidth: '140',
            slots: {
              default: ({ row, column, rowIndex }) => {
                return [<span>{row[column.field]}</span>]
              },
              edit: ({ row, rowIndex, column }) => {
                return [<a-button size='mini' type='text' onClick={() => setDynamicJson({ row, rowIndex, column })} onKeyPress={() => { }}>编辑</a-button>]
              }
            }
          },
          {
            field: 'cDynamicRules',
            title: '自定义校验规则',
            minWidth: '140',
            editRender: {},
            slots: {
              default: ({ row, column, rowIndex }) => {
                return [<span>{row[column.field]}</span>]
              },
              edit: ({ row, rowIndex, column }) => {
                return [<a-button size='mini' type='text' onClick={() => setDynamicJson({ row, rowIndex, column })} onKeyPress={() => { }}>编辑</a-button>]
              }
            }
          },
          {
            field: 'cDynamicDisabled',
            title: '自定义启用/禁用',
            minWidth: '140',
            editRender: {},
            slots: {
              default: ({ row, column, rowIndex }) => {
                return [<span>{row[column.field]}</span>]
              },
              edit: ({ row, rowIndex, column }) => {
                return [<a-button size='mini' type='text' onClick={() => setDynamicJson({ row, rowIndex, column })} onKeyPress={() => { }}>编辑</a-button>]
              }
            }
          },
          {
            field: 'cDirectives',
            title: '自定义指令',
            minWidth: '140',
            editRender: {
              ...SelectRender,
              options: selectOpts.directivesOpts,
            }
          },
          {
            field: 'cAlign',
            title: '字段对齐方式',
            minWidth: '140',
            editRender: {
              ...SelectRender,
              options: selectOpts.alignOpts,
            }
          },
          {
            field: 'cWidth',
            title: '字段宽度',
            minWidth: '140',
            editRender: InputRender
          },
          {
            field: 'nLg',
            title: '栅格占比(lg)',
            minWidth: '100',
            editRender: InputRender
          },
          {
            field: 'cRequired',
            title: '是否校验',
            minWidth: '140',
            editRender: {
              ...SelectRender,
              options: selectOpts.requiredOpts,
            }
          },
          {
            field: 'nI18ndata',
            title: '是否开启数据国际化',
            minWidth: '200',
            editRender: {
              ...SelectRender,
              options: selectOpts.signOpts,
            }
          },
          {
            field: 'i18n',
            title: '国际化',
            minWidth: '140',
            editRender: {},
            slots: {
              default: ({ row, column, rowIndex }) => {
                return [<span>{row[column.field]}</span>]
              },
              edit: ({ row, column, rowIndex }) => {
                return [<a-button size='mini' type='text' onClick={() => setDynamicI18n({ row, rowIndex, column })} onKeyPress={() => { }}>编辑</a-button>]
              }
            }
          },
          {
            field: 'cStoremethod',
            title: 'vuex方法',
            minWidth: '180',
            editRender: InputRender
          },
          {
            field: 'cPlaceholder',
            title: '占位符',
            minWidth: '140',
            editRender: InputRender
          },
          {
            field: 'cSlot',
            title: '具名插槽name',
            minWidth: '140',
            editRender: InputRender
          },
          {
            field: 'cTip',
            title: '提示词',
            minWidth: '140',
            editRender: InputRender
          },
          {
            field: 'cEntityTable',
            title: '对应后端实体表名',
            minWidth: '160',
            editRender: {},
            slots: {
              default: ({ row, column, rowIndex }) => {
                return [<span>{row[column.field]}</span>]
              },
              edit: ({ row, column, rowIndex }) => {
                return [<a-button size='mini' type='text' onClick={() => pickTable({ 'selection': false, row, column, rowIndex })} onKeyPress={() => { }}>{row[column.field] ? row[column.field] : '选择'}</a-button>]
              }
            }
          },
          {
            field: 'cEntityCol',
            title: '对应后端实体表列名',
            minWidth: '160',
            editRender: {},
            slots: {
              default: ({ row, column, rowIndex }) => {
                return [<span>{row[column.field]}</span>]
              },
              edit: ({ row, column, rowIndex }) => {
                return [<a-button size='mini' type='text' onClick={() => pickTable({ 'selection': false, row, column, rowIndex })} onKeyPress={() => { }}>{row[column.field] ? row[column.field] : '选择'}</a-button>]
              }
            }
          },
          {
            field: 'action',
            title: '操作',
            fixed: 'right',
            width: '130',
            dragSort: true,
            slots: {
              default: ({ row, column, rowIndex }) => {
                return [
                  <div class='flex items-center gap-1'>
                    <a-tooltip
                      content='删除'
                      mini={true}
                    >
                      <SunnyIcon
                        icon='lucide:x'
                        class="w-4 h-4 cursor-pointer outline-none"
                        onClick={() => deleteRow(rowIndex)}
                        onKeyPress={() => { }}
                      />
                    </a-tooltip>
                    <a-tooltip
                      content='额外参数'
                      mini={true}
                    >
                      <SunnyIcon
                        icon='lucide:more-horizontal'
                        class="w-4 h-4 cursor-pointer outline-none"
                        onClick={() => metaEdit({ row, rowIndex })}
                        onKeyPress={() => { }}
                      />
                    </a-tooltip>
                    <a-tooltip
                      content='插入行'
                      mini={true}
                    >
                      <SunnyIcon
                        icon="lucide:plus"
                        class="w-4 h-4 cursor-pointer outline-none"
                        onClick={() => insertRow({ rowIndex })}
                        onKeyPress={() => { }}
                      />
                    </a-tooltip>
                  </div>
                ]
              }
            }
          }
        ]
      } else if (type === 'Button') {
        column = publicButtonColumns({ type, area, datePickSetMeta, setDynamicJson, setDynamicI18n, pickTable, deleteRow, insertRow, metaEdit, setCallmethodsJson })
      }
      break
  }
  return column
}

// 所在区域建议
export const areaSuggestion = [{
  value: 'searchForm'
},
{
  value: 'searchTable'
}]

// 按钮资源公用编辑列
function publicButtonColumns({ area, setCallmethodsJson, setDynamicI18n, deleteRow }) {
  return [
    {
      field: 'id',
      title: 'ID',
      width: '60'
    },
    {
      field: 'cArea',
      title: '所在区域',
      minWidth: '100',
      editRender: {},
      slots: {
        default: ({ row, column, rowIndex }) => {
          return [<span>{row[column.field]}</span>]
        },
        edit: ({ row, column, rowIndex }) => {
          return area ? [<span>{row[column.field]}</span>] : [<vxe-input v-model={row[column.field]} allow-clear />]
        }
      }
    },
    {
      field: 'cSubArea',
      title: '细分区域',
      minWidth: '100',
      editRender: InputRender
    },
    {
      field: 'cName',
      title: '按钮名称',
      minWidth: '100',
      editRender: InputRender
    },
    {
      field: 'cStoremethod',
      title: 'vuex方法',
      minWidth: '180',
      editRender: InputRender
    },
    {
      field: 'cAuth',
      title: '权限管控',
      minWidth: '100',
      editRender: {
        ...SelectRender,
        options: selectOpts.authOpts,
      }
    },
    {
      field: 'cValid',
      title: '校验表单',
      minWidth: '100',
      editRender: {
        ...SelectRender,
        options: selectOpts.requiredOpts,
      }
    },
    {
      field: 'cSign',
      title: '启用/禁用',
      minWidth: '100',
      editRender: {
        ...SelectRender,
        options: selectOpts.signOpts,
      }
    },
    {
      field: 'cIcon',
      title: '图标',
      minWidth: '125',
      editRender: InputRender
    },
    {
      field: 'cClass',
      title: '按钮Class',
      minWidth: '125',
      editRender: InputRender
    },
    {
      field: 'cCallmethod',
      title: '导入/导出配置',
      minWidth: '125',
      editRender: {},
      slots: {
        default: ({ row, column, rowIndex }) => {
          return [<span>{row[column.field]}</span>]
        },
        edit: ({ row, rowIndex, column }) => {
          return [<a-button size='mini' type='text' onClick={() => setCallmethodsJson({ row, rowIndex, column })} onKeyPress={() => { }}>编辑</a-button>]
        }
      }
    },
    {
      field: 'i18n',
      title: '国际化',
      minWidth: '140',
      editRender: {},
      slots: {
        default: ({ row, column, rowIndex }) => {
          return [<span>{row[column.field]}</span>]
        },
        edit: ({ row, column, rowIndex }) => {
          return [<a-button size='mini' type='text' onClick={() => setDynamicI18n({ row, rowIndex, column })} onKeyPress={() => { }}>编辑</a-button>]
        }
      }
    },
    {
      field: 'action',
      title: '操作',
      fixed: 'right',
      width: '130',
      dragSort: true,
      slots: {
        default: ({ row, column, rowIndex }) => {
          return [
            <div class='flex items-center gap-1'>
              <a-tooltip
                content='删除'
                mini={true}
              >
                <SunnyIcon
                  icon='lucide:x'
                  class="w-4 h-4 cursor-pointer outline-none"
                  onClick={() => deleteRow(rowIndex)}
                  onKeyPress={() => { }}
                />
              </a-tooltip>
            </div>
          ]
        }
      }
    }
  ]
}
