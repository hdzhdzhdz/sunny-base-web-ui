import { h } from 'vue'
import { VxeUI } from 'vxe-table'
import XEUtils from 'xe-utils'

import VxeTmplFilterCombination from './FilterCombination.vue'

export interface FilterAggregationOptionData {
  checks: string[];
  sVal: string;
}

/**
 * FilterAggregation
 */
VxeUI.renderer.add('FilterAggregation', {
  showFilterFooter: false,
  createTableFilterOptions () {
    return [
      { data: { checks: [], sVal: '' } }
    ]
  },
  renderFilter (renderOpts, renderParams) {
    return h(VxeTmplFilterCombination, {
      renderParams,
      renderOpts,
      showFixed: true,
      showSort: true
    })
  },
  filterResetMethod ({ options }) {
    options.forEach(option => {
      const optData: FilterAggregationOptionData = { checks: [], sVal: '' }
      option.data = optData
    })
  },
  filterMethod ({ option, row, column }) {
    const { checks } = option.data as FilterAggregationOptionData
    const cellValue: any = XEUtils.get(row, column.field)
    return checks.includes(XEUtils.toValueString(cellValue))
  }
})

export interface FilterCombinationOptionData {
  checks: string[];
  sVal: string;
  fMenu: string;
  fType1: string;
  fVal1: string;
  fMode: string;
  fType2: string;
  fVal2: string;
}

const reKeys: Record<string, string> = { '~*': '\\*', '~?': '\\?' }
const reLikes: Record<string, string> = { '*': '.*', '?': '.{1}', '~': '~' }

function getMatchRE (matchText: string | number, isbegin: boolean, isEndin: boolean) {
  return new RegExp((isbegin ? '^' : '') + '(' + `${matchText || ''}`.replace(/(~\*)|(~\?)|(~+)|(\*+)|(\?)/g, match => reKeys[match] || reLikes[match.charAt(0)]) + ')' + (isEndin ? '$' : ''))
}

/**
 * FilterCombination
 */
VxeUI.renderer.add('FilterCombination', {
  showFilterFooter: false,
  createTableFilterOptions () {
    return [
      { data: { checks: [], sVal: '', sMenu: '', fType1: '', fVal1: '', fMode: 'and', fType2: '', fVal2: '' } }
    ]
  },
  renderFilter (renderOpts, renderParams) {
    return h(VxeTmplFilterCombination, {
      renderParams,
      renderOpts,
      showFixed: true,
      showSort: true,
      showFilter: true
    })
  },
  filterResetMethod ({ options }) {
    options.forEach(option => {
      const optData: FilterCombinationOptionData = { checks: [], sVal: '', fMenu: '', fType1: '', fVal1: '', fMode: 'and', fType2: '', fVal2: '' }
      option.data = optData
    })
  },
  filterMethod ({ option, row, column }) {
    /* eslint-disable eqeqeq */
    const { checks, fType1, fVal1, fMode, fType2, fVal2 } = option.data as FilterCombinationOptionData
    let cellValue = XEUtils.get(row, column.field)
    if (fType1 || fType2) {
      const currDate = new Date()
      const compConfig = VxeUI.getConfig()

      const calculate = (type: string, val: string) => {
        let matchText: any
        if (['gt', 'ge', 'lt', 'le'].includes(type)) {
          cellValue = XEUtils.toNumber(cellValue)
          matchText = XEUtils.toNumber(val)
        } else if (['isBefore', 'eqBefore', 'isAfter', 'eqAfter'].includes(type)) {
          cellValue = XEUtils.toStringDate(cellValue)
          matchText = XEUtils.toStringDate(val)
        } else {
          cellValue = XEUtils.toValueString(cellValue).toLowerCase()
          matchText = XEUtils.toValueString(val).toLowerCase()
        }
        switch (type) {
          // 通用匹配
          case 'equal':
            return getMatchRE(matchText, true, true).test(cellValue)
          case 'unequal':
            return !getMatchRE(matchText, true, true).test(cellValue)
          case 'begin':
            return getMatchRE(matchText, true, false).test(cellValue)
          case 'notbegin':
            return !getMatchRE(matchText, true, false).test(cellValue)
          case 'endin':
            return getMatchRE(matchText, false, true).test(cellValue)
          case 'notendin':
            return !getMatchRE(matchText, false, true).test(cellValue)
          case 'include':
            return getMatchRE(matchText, false, false).test(cellValue)
          case 'exclude':
            return !getMatchRE(matchText, false, false).test(cellValue)
          // 数值匹配
          case 'gt':
            return cellValue > matchText
          case 'ge':
            return cellValue > matchText || cellValue == matchText
          case 'lt':
            return cellValue < matchText
          case 'le':
            return cellValue < matchText || cellValue == matchText
            // 日期
          case 'isBefore':
            return cellValue < matchText
          case 'eqBefore':
            return cellValue <= matchText
          case 'isAfter':
            return cellValue > matchText
          case 'eqAfter':
            return cellValue >= matchText
          case 'tomorrow':
          case 'today':
          case 'yesterday': {
            const cellDate = XEUtils.toStringDate(cellValue)
            return XEUtils.isDateSame(cellDate, XEUtils.getWhatDay(currDate, type === 'tomorrow' ? 1 : (type === 'yesterday' ? -1 : 0)), 'yyyy-MM-dd')
          }
          case 'nextWeek':
          case 'thisWeek':
          case 'lastWeek': {
            const cellDate = XEUtils.toStringDate(cellValue)
            const swData = XEUtils.getWhatDay(XEUtils.getWhatWeek(currDate, type === 'nextWeek' ? 1 : (type === 'lastWeek' ? -1 : 0), compConfig.datePicker.startDay, compConfig.datePicker.startDay), 0, 'first')
            const ewData = XEUtils.getWhatDay(swData, 6, 'last')
            return cellDate >= swData && cellDate <= ewData
          }
          case 'nextMonth':
          case 'thisMonth':
          case 'lastMonth': {
            const cellDate = XEUtils.toStringDate(cellValue)
            return XEUtils.isDateSame(cellDate, XEUtils.getWhatMonth(currDate, type === 'nextMonth' ? 1 : (type === 'lastMonth' ? -1 : 0)), 'yyyy-MM')
          }
          case 'nextYear':
          case 'thisYear':
          case 'lastYear': {
            const cellDate = XEUtils.toStringDate(cellValue)
            return XEUtils.isDateSame(cellDate, XEUtils.getWhatYear(currDate, type === 'nextYear' ? 1 : (type === 'lastYear' ? -1 : 0)), 'yyyy')
          }
          case 'yearToDate': {
            const cellDate = XEUtils.toStringDate(cellValue)
            return cellDate >= XEUtils.getWhatYear(currDate, 0, 'first') && cellDate <= currDate
          }
        }
        return true
      }
      const f1Rest = calculate(fType1, fVal1)
      if (fMode === 'and') {
        return f1Rest && calculate(fType2, fVal2)
      }
      return f1Rest || calculate(fType2, fVal2)
    } else if (checks.length) {
      return checks.includes(XEUtils.toValueString(cellValue))
    }
    return false
  }
})
