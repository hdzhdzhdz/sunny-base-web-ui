import SelectOptions from './select-options'
import { getCurrentUserResourcesByParId } from '../api/resource'
import { groupBy, orderBy, map, unset } from 'lodash-es'
import { EditRender, Validators } from '@sunny-base-web/ui'

/**
 * 构建按钮a-button配置项
 * @param {*} resource
 */
export function initButtonItem(data: any) {
  const { cName, cStoremethod, cIcon, cClass, nOrder, id, cEvent, cSubArea } = data

  return {
    label: cName,
    handle: cStoremethod,
    icon: cIcon,
    class: cClass,
    order: nOrder,
    loading: false,
    size: 'mini',
    nButtonid: id, // 按钮id
    cEvent: cEvent,
    cSubArea: cSubArea,
    // vxe-grid 按钮配置项
    name: cName,
    code: cStoremethod,
  }
}

/**
 * 构建表格vxe-column配置项
 * @param {*} resource
 */
export function initVxeColumn(data: any) {
  const { cLabel, cProp, cFieldtype, cMeta, cSeltype, cSelval, cWidth, nOrder, nBill, cSign, cRequired, cShow, cDirectives, cEntityTable, cDynamicRules, cDynamicDisabled } = data
  const MetaObj = cMeta ? JSON.parse(cMeta) : {}
  var itemObj = {
    title: cLabel,
    field: cProp,
    width: cWidth,
    ...(EditRender as any)[cFieldtype] ?? {},
    params: {
      required: cRequired === '0',
      disabled: cSign === '0',
      visible: cShow === '0',
      order: nOrder,
      nBill: nBill, // 业务履历
      cEntityTable: cEntityTable // 对应后端实体表名
    },
  }

  // 先进行额外数据合并，再进行特殊情况数据操作
  itemObj = { ...MetaObj, ...itemObj }
  // unset(itemObj, 'type') // 移除type属性，原因：用于表单的type属性会在列(vxe-columns)属性中报警告

  // if (cDynamicDisabled) {
  //   itemObj.disabled = (row, field, item) => {
  //     debugger
  //     const cRules = JSON.parse(cDynamicDisabled)
  //     const cList = cRules.map(tt => {
  //       return `${row[tt.prop] || undefined} ${tt.comparison} ${tt.value || undefined}`
  //     })
  //     const cLogical = _.first(cRules)?.logical
  //     const cStr = cList.join(` ${cLogical} `)
  //     return new Function(`return ${cStr}`)()
  //   }
  // }

  if (cSeltype && cSelval) {
    itemObj.params.options = getOptionsForSelectType(data)
    // if (cFieldtype === 'spanselect' || cFieldtype === 'Select') {
    //   if (cSeltype === '3') {
    //     store.dispatch('zdyxlk/assQuery', { cNum: cSelval, attrParam: {}}).then(res => {
    //       itemObj.params.options = res.result.optionList
    //     })
    //   }
    //   itemObj.slots = {
    //     default: ({ row, column }, h) => {
    //       return filterSelect(row[column.property], itemObj.params.options)
    //     }
    //   }
    // }
  }

  return itemObj
}

export function getResourceByParIdOrModnumb({ parId, modnumb }: { parId?: string; modnumb?: string }) {
  if (parId || modnumb) {
    return getCurrentUserResourcesByParId({ parId, modnumb, types: [2, 3] }).then(({ data }) => {
      debugger
      return data || []
    })
  }
}

export function initResourceConstructor(result: any): {
  resFieldList: Record<string, any[]>
  resButtonList: Record<string, any[]>
  resColumnList: Record<string, any[]>
  resMenu: any
} {
    const resFieldList = groupBy(orderBy(result.resFieldList.map((fl: any) => {
      return {
        // ...initFormItem.apply(this, [fl]),
        ...fl,
        cArea: fl.cArea
      }
    }), ['order'], ['asc']), 'cArea')
    const resButtonList = groupBy(orderBy(result.resButtonList.map((fl: any) => {
      return {
        ...initButtonItem(fl),
        cArea: fl.cArea,
        cSubArea: fl.cSubArea
      }
    }), ['order'], ['asc']), 'cArea')
    const resColumnList = groupBy(orderBy(result.resFieldList.map((fl: any) => {
      return {
        ...initVxeColumn(fl),
        cArea: fl.cArea
      }
    }), ['order'], ['asc']), 'cArea')

    const resMenu = result.resMenu
    return {
      resFieldList,
      resButtonList,
      resColumnList,
      // resEditRulesList,
      resMenu
    }
}

/**
 * 根据字段配置项构建options
 * @param {*} resource
 */
export function getOptionsForSelectType(item: any) {
  const { cSeltype, cSelval, fieldDictList, fieldUserExresList } = item
  var options = []
  // 0:数据字典 \ 1:select-options \ 2:工厂 \ 3:自定义下拉 \ 4:其他权限
  if (cSeltype === '0') {
    options = fieldDictList.map((el: any) => {
      return {
        label: el.cName,
        value: el.cXuhao,
        cConnkey: el.cConnkey
      }
    })
  } else if (cSeltype === '1') {
    options = SelectOptions[cSelval]
  } else if (cSeltype === '2') {
    // options = store.getters.gc
    options = []
  } else if (cSeltype === '3') {
    options = []
  } else if (cSeltype === '4') {
    options = fieldUserExresList.map((el: any) => {
      return {
        label: el.cExresnum + '-' + el.cExresname,
        value: el.cExresnum
      }
    })
  }
  return options
}