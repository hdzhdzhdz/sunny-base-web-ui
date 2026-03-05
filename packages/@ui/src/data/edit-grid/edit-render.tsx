import { Input, InputNumber, Select, DatePicker, MonthPicker, YearPicker, WeekPicker, RangePicker, Switch, Button, Textarea, Popover } from '@arco-design/web-vue'
import { SunnyBusinessSearch } from '@sunny-base-web/ui'
import { isArray } from 'lodash-es'
import { ref } from 'vue'

// 文本
export const SpanRender = {
  editRender: {},
  slots: {
    default: ({ row, column }: { row: any, column: any }) => {
      const value = row[column.field]
      const options = column.params?.options
      const option = options?.find((item: any) => item.value === value)
      return [<span>{option?.label ?? value}</span>]
    }
  }
}

// 文本-选项筛选
export const SpanselectRender = {
  editRender: {},
  slots: {
    default: ({ row, column }: { row: any, column: any }) => {
      return [<span>{row[column.field]}</span>]
    }
  }
}

// 输入框
export const InputRender = {
  editRender: {},
  slots: {
    default: ({ row, column }: { row: any, column: any }) => {
      return [<span>{row[column.field]}</span>]
    },
    edit: ({ row, column }: { row: any, column: any }) => {
      return [
        <Input 
          modelValue={row[column.field]} 
          onUpdate:modelValue={(val: any) => {
            row[column.field] = val
          }}
          {...column.params}
        />
      ]
    }
  }
}

// 选择框
export const SelectRender = {
  editRender: {},
  slots: {
    default: ({ row, column }: { row: any, column: any }) => {
      const value = row[column.field]
      const options = column.params?.options
      const option = options?.find((item: any) => item.value === value)
      return [<span>{option?.label ?? value}</span>]
    },
    edit: ({ row, column }: { row: any, column: any }) => {
      return [
        <Select
          modelValue={row[column.field]}
          onUpdate:modelValue={(val: any) => {
            row[column.field] = val
          }}
          {...column.params}
        />
      ]
    }
  }
}

// 日期选择器
export const DatePickerRender = {
  editRender: {},
  slots: {
    default: ({ row, column }: { row: any, column: any }) => {
      return [<span>{row[column.field]}</span>]
    },
    edit: ({ row, column }: { row: any, column: any }) => {
      return [
        <DatePicker
          modelValue={row[column.field]}
          onUpdate:modelValue={(val: any) => {
            row[column.field] = val
          }}
          {...column.params}
        />
      ]
    }
  }
}

// 月份选择器
export const MonthPickerRender = {
  editRender: {},
  slots: {
    default: ({ row, column }: { row: any, column: any }) => {
      return [<span>{row[column.field]}</span>]
    },
    edit: ({ row, column }: { row: any, column: any }) => {
      return [
        <MonthPicker
          modelValue={row[column.field]}
          onUpdate:modelValue={(val: any) => {
            row[column.field] = val
          }}
          {...column.params}
        />
      ]
    }
  }
}

// 年份选择器
export const YearPickerRender = {
  editRender: {},
  slots: {
    default: ({ row, column }: { row: any, column: any }) => {
      return [<span>{row[column.field]}</span>]
    },
    edit: ({ row, column }: { row: any, column: any }) => {
      return [
        <YearPicker
          modelValue={row[column.field]}
          onUpdate:modelValue={(val: any) => {
            row[column.field] = val
          }}
          {...column.params}
        />
      ]
    }
  }
}

// 周选择器
export const WeekPickerRender = {
  editRender: {},
  slots: {
    default: ({ row, column }: { row: any, column: any }) => {
      return [<span>{row[column.field]}</span>]
    },
    edit: ({ row, column }: { row: any, column: any }) => {
      return [
        <WeekPicker
          modelValue={row[column.field]}
          onUpdate:modelValue={(val: any) => {
            row[column.field] = val
          }}
          {...column.params}
        />
      ]
    }
  }
}

// 日期范围选择器
export const RangePickerRender = {
  editRender: {},
  slots: {
    default: ({ row, column }: { row: any, column: any }) => {
      const fieldNames = column.params?.fieldNames
      let value: any

      if (fieldNames) {
        const startDate = row[fieldNames.start]
        const endDate = row[fieldNames.end]
        value = [startDate, endDate]
      } else {
        value = row[column.field]
      }

      return [<span>{isArray(value) ? value.join(' / ') : value}</span>]
    },
    edit: ({ row, column }: { row: any, column: any }) => {
      const fieldNames = column.params?.fieldNames
      let modelValue: any

      if (fieldNames) {
        const startDate = row[fieldNames.start]
        const endDate = row[fieldNames.end]
        modelValue = [startDate, endDate]
      } else {
        modelValue = row[column.field]
      }

      return [
        <RangePicker
          modelValue={modelValue}
          onUpdate:modelValue={(val: any) => {
            if (fieldNames) {
              if (isArray(val) && val.length === 2) {
                row[fieldNames.start] = val[0]
                row[fieldNames.end] = val[1]
              } else {
                row[fieldNames.start] = undefined
                row[fieldNames.end] = undefined
              }
            } else {
              row[column.field] = val
            }
          }}
          {...column.params}
        />
      ]
    }
  }
}

// 开关
export const SwitchRender = {
  editRender: {},
  slots: {
    default: ({ row, column }: { row: any, column: any }) => {
      const { checkedValue, checkedText, uncheckedValue, uncheckedText } = column.params || {}
      const value = row[column.field]

      if (checkedValue !== undefined && checkedText !== undefined && value === checkedValue) {
        return [<span>{checkedText}</span>]
      }
      if (uncheckedValue !== undefined && uncheckedText !== undefined && value === uncheckedValue) {
        return [<span>{uncheckedText}</span>]
      }

      return [<span>{value}</span>]
    },
    edit: ({ row, column }: { row: any, column: any }) => {
      return [
        <Switch
          modelValue={row[column.field]}
          onUpdate:modelValue={(val: any) => {
            row[column.field] = val
          }}
          {...column.params}
        />
      ]
    }
  }
}

// 数字输入框
export const InputNumberRender = {
  editRender: {},
  slots: {
    default: ({ row, column }: { row: any, column: any }) => {
      return [<span>{row[column.field]}</span>]
    },
    edit: ({ row, column }: { row: any, column: any }) => {
      const value = row[column.field]
      const modelValue = typeof value === 'string' && value !== '' ? Number(value) : value

      return [
        <InputNumber
          modelValue={modelValue}
          onUpdate:modelValue={(val: any) => {
            if (typeof value === 'string' && val !== null && val !== undefined) {
              row[column.field] = String(val)
            } else {
              row[column.field] = val
            }
          }}
          {...column.params}
        />
      ]
    }
  }
}

// 区间输入框
export const InputRangeRender = {
  editRender: {},
  slots: {
    default: ({ row, column }: { row: any, column: any }) => {
      const fieldNames = column.params?.fieldNames
      let value: any

      if (fieldNames) {
        const start = row[fieldNames.start]
        const end = row[fieldNames.end]
        value = [start, end]
      } else {
        value = row[column.field]
      }

      return [<span>{isArray(value) ? value.join(' ~ ') : value}</span>]
    },
    edit: ({ row, column }: { row: any, column: any }) => {
      const fieldNames = column.params?.fieldNames
      const inputType = column.params?.inputType || 'input'
      const Component = inputType === 'number' ? InputNumber : Input

      if (fieldNames) {
        const startValue = row[fieldNames.start]
        const endValue = row[fieldNames.end]
        const startModelValue = inputType === 'number' && typeof startValue === 'string' && startValue !== '' ? Number(startValue) : startValue
        const endModelValue = inputType === 'number' && typeof endValue === 'string' && endValue !== '' ? Number(endValue) : endValue

        return [
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Component
              modelValue={startModelValue}
              onUpdate:modelValue={(val: any) => {
                if (inputType === 'number' && typeof startValue === 'string' && val !== null && val !== undefined) {
                  row[fieldNames.start] = String(val)
                } else {
                  row[fieldNames.start] = val
                }
              }}
              {...column.params}
            />
            <span>~</span>
            <Component
              modelValue={endModelValue}
              onUpdate:modelValue={(val: any) => {
                if (inputType === 'number' && typeof endValue === 'string' && val !== null && val !== undefined) {
                  row[fieldNames.end] = String(val)
                } else {
                  row[fieldNames.end] = val
                }
              }}
              {...column.params}
            />
          </div>
        ]
      }

      const value = row[column.field]
      const modelValue = inputType === 'number' && typeof value === 'string' && value !== '' ? Number(value) : value

      return [
        <Component
          modelValue={modelValue}
          onUpdate:modelValue={(val: any) => {
            if (inputType === 'number' && typeof value === 'string' && val !== null && val !== undefined) {
              row[column.field] = String(val)
            } else {
              row[column.field] = val
            }
          }}
          {...column.params}
        />
      ]
    }
  }
}

// 多行文本框
export const TextareaRender = {
  editRender: {},
  slots: {
    default: ({ row, column }: { row: any, column: any }) => {
      return [<span>{row[column.field]}</span>]
    },
    edit: ({ row, column }: { row: any, column: any }) => {
      const visible = ref(false)
      const inputValue = ref(row[column.field] || '')

      return [
        <Popover
          v-model:popupVisible={visible.value}
          trigger="click"
          position="top"
        >
          {{
            default: () => [
              <Input
                modelValue={inputValue.value}
                onUpdate:modelValue={(val: any) => {
                  inputValue.value = val
                  row[column.field] = val
                }}
                onFocus={() => {
                  visible.value = true
                }}
                {...column.params}
              />
            ],
            content: () => [
              <Textarea
                modelValue={inputValue.value}
                onUpdate:modelValue={(val: any) => {
                  inputValue.value = val
                  row[column.field] = val
                }}
                autoSize={{ minRows: 3, maxRows: 6 }}
                placeholder={column.params?.placeholder || '请输入内容'}
                {...column.params}
              />
            ]
          }}
        </Popover>
      ]
    }
  }
}

// 业务搜索组件(公共查询弹窗)
export const BusinessSearchRender = {
  editRender: {},
  slots: {
    default: ({ row, column }: { row: any, column: any }) => {
      return [<span>{row[column.field] ? JSON.stringify(row[column.field]) : ''}</span>]
    },
    edit: ({ row, column }: { row: any, column: any }) => {
      return [
        <SunnyBusinessSearch
          modelValue={row[column.field]}
          onUpdate:modelValue={(val: any) => { row[column.field] = val }}
          {...column.params}
        />]
    }
  }
}