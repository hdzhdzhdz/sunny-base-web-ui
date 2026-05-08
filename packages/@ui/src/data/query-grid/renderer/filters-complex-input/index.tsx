import XEUtils from 'xe-utils'
import { VxeUI } from 'vxe-table'

import VxeTmplFilterComplexInput from './FilterComplexInput.vue'

export interface FilterSimpleInputOptionData {
  isSensitive: boolean;
  sVal: string;
  _sVal: string;
}

/**
 * FilterSimpleInput
 */
VxeUI.renderer.add('FilterSimpleInput', {
  showFilterFooter: false,
  createTableFilterOptions () {
    return [
      { data: { isSensitive: false, sVal: '' , _sVal: '' } }
    ]
  },
  renderFilter (renderOpts, params) {
    return <VxeTmplFilterComplexInput render-params={ params } render-opts={ renderOpts }></VxeTmplFilterComplexInput>
  },
  filterResetMethod ({ options }) {
    options.forEach(option => {
      const optData: FilterSimpleInputOptionData = { isSensitive: false, sVal: '', _sVal: '' }
      option.data = optData
    })
  },
  filterMethod ({ option, row, column }) {
    let cellValue = XEUtils.toValueString(XEUtils.get(row, column.field))
    const { isSensitive, _sVal } = option.data
    let matchText = XEUtils.toValueString(_sVal)
    if (!isSensitive) {
      cellValue = cellValue.toLowerCase()
      matchText = matchText.toLowerCase()
    }
    return cellValue.indexOf(matchText) > -1
  }
})

export interface FilterComplexInputOptionData {
  isSensitive: boolean;
  sVal: string;
  _sVal: string;
  sType: string;
}

/**
 * FilterComplexInput
 */
VxeUI.renderer.add('FilterComplexInput', {
  showFilterFooter: false,
  createTableFilterOptions () {
    return [
      { data: { sType: 'include', isSensitive: false, sVal: '' , _sVal: '' } }
    ]
  },
  renderFilter (renderOpts, params) {
    return <VxeTmplFilterComplexInput render-params={ params } render-opts={ renderOpts } show-types></VxeTmplFilterComplexInput>
  },
  filterResetMethod ({ options }) {
    options.forEach(option => {
      const optData: FilterComplexInputOptionData = { sType: 'include', isSensitive: false, sVal: '', _sVal: '' }
      option.data = optData
    })
  },
  filterMethod ({ option, row, column }) {
    /* eslint-disable eqeqeq */
    const { sType, isSensitive, _sVal } = option.data
    let cellValue = XEUtils.get(row, column.field)
    let matchText
    if (['gt', 'lt'].includes(sType)) {
      cellValue = XEUtils.toNumber(cellValue)
      matchText = XEUtils.toNumber(_sVal)
    } else {
      cellValue = XEUtils.toValueString(cellValue)
      matchText = XEUtils.toValueString(_sVal)
      if (!isSensitive) {
        cellValue = cellValue.toLowerCase()
        matchText = matchText.toLowerCase()
      }
    }
    switch (sType) {
      // 数值匹配
      case 'gt':
        return cellValue > matchText
      case 'lt':
        return cellValue < matchText
      // 通用匹配
      case 'equal':
        return cellValue == matchText
      case 'begin':
        return cellValue.indexOf(matchText) === 0
      case 'endin': {
        const index = cellValue.lastIndexOf(matchText)
        return index > -1 && index === cellValue.length - (matchText as string).length
      }
    }
    return cellValue.indexOf(matchText) > -1
  }
})
