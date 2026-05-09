<template>
  <div :class="['vxe-table-filter-combination', {'is--cloak': isRenderStatus }]">
    <div v-if="showFixed || showSort || showFilter" class="vxe-tmpl-filter--menus">
      <ul v-if="isMiniMenu && showSort" class="vxe-tmpl-filter--menu-group">
        <li class="vxe-tmpl-filter--menu-item" :class="{'is-active': column && column.order, 'is-hover': hoverMenu === 'sort'}" @mouseenter="mouseenterEvent($event, 'sort')" @mouseleave="mouseleaveEvent($event)">
          <div class="vxe-tmpl-filter--menu-left-icon">
            <i v-if="column && column.order === 'asc'" :class="[isNumType ? 'vxe-icon-sort-numeric-asc' : 'vxe-icon-sort-alpha-asc']"></i>
            <i v-else-if="column && column.order === 'desc'" :class="[isNumType ? 'vxe-icon-sort-numeric-desc' : 'vxe-icon-sort-alpha-desc']"></i>
          </div>
          <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.sort') }}</div>
          <div class="vxe-tmpl-filter--menu-right-icon">
            <i class="vxe-icon-arrow-right"></i>
          </div>
          <div class="vxe-tmpl-filter--child-menu-group" :class="[`pos-${childMenuPos}`]">
            <ul class="vxe-tmpl-filter--child-menu-list">
              <li class="vxe-tmpl-filter--child-menu-item" :class="{'is-disabled': !(column && column.order)}" @click="clearSort($event)">
                <div class="vxe-tmpl-filter--menu-left-icon">
                  <i class="vxe-icon-close"></i>
                </div>
                <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.clearSort') }}</div>
              </li>
              <li class="vxe-tmpl-filter--child-menu-item" :class="{'is-disabled': !allowSortable, 'is-active': column && column.order === 'asc'}" @click="sortColumn($event, 'asc')">
                <div class="vxe-tmpl-filter--child-menu-left-icon">
                  <i class="vxe-icon-check"></i>
                </div>
                <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.sortAsc') }}</div>
              </li>
              <li class="vxe-tmpl-filter--child-menu-item" :class="{'is-disabled': !allowSortable, 'is-active': column && column.order === 'desc'}" @click="sortColumn($event, 'desc')">
                <div class="vxe-tmpl-filter--child-menu-left-icon">
                  <i class="vxe-icon-check"></i>
                </div>
                <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.sortDesc') }}</div>
              </li>
            </ul>
          </div>
        </li>
      </ul>
      <ul v-else-if="showSort" class="vxe-tmpl-filter--menu-group">
        <li class="vxe-tmpl-filter--menu-item" :class="{'is-disabled': !allowSortable, 'is-active': column && column.order === 'asc'}" @click="sortColumn($event, 'asc')" @mouseenter="mouseenterEvent($event, 'ascSort')" @mouseleave="mouseleaveEvent($event)">
          <div class="vxe-tmpl-filter--menu-left-icon">
            <i :class="[isNumType ? 'vxe-icon-sort-numeric-asc' : 'vxe-icon-sort-alpha-asc']"></i>
          </div>
          <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.sortAsc') }}</div>
        </li>
        <li class="vxe-tmpl-filter--menu-item" :class="{'is-disabled': !allowSortable, 'is-active': column && column.order === 'desc'}" @click="sortColumn($event, 'desc')" @mouseenter="mouseenterEvent($event, 'descSort')" @mouseleave="mouseleaveEvent($event)">
          <div class="vxe-tmpl-filter--menu-left-icon">
            <i :class="[isNumType ? 'vxe-icon-sort-numeric-desc' : 'vxe-icon-sort-alpha-desc']"></i>
          </div>
          <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.sortDesc') }}</div>
        </li>
        <li class="vxe-tmpl-filter--menu-item" :class="{'is-disabled': !(column && column.order)}" @click="clearSort($event)" @mouseenter="mouseenterEvent($event, 'clearSort')" @mouseleave="mouseleaveEvent($event)">
          <div class="vxe-tmpl-filter--menu-left-icon">
            <i class="vxe-icon-close"></i>
          </div>
          <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.clearSort') }}</div>
        </li>
      </ul>
      <ul v-if="showFixed" class="vxe-tmpl-filter--menu-group">
        <li class="vxe-tmpl-filter--menu-item" :class="{'is-active': column && column.fixed, 'is-hover': hoverMenu === 'fixed'}" @mouseenter="mouseenterEvent($event, 'fixed')" @mouseleave="mouseleaveEvent($event)">
          <div class="vxe-tmpl-filter--menu-left-icon">
            <i v-if="column && column.fixed === 'left'" class="vxe-icon-fixed-left-fill"></i>
            <i v-if="column && column.fixed === 'right'" class="vxe-icon-fixed-right-fill"></i>
          </div>
          <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n(column && column.parentId ? 'vxe.renderer.combination.menus.fixedGroup' : 'vxe.renderer.combination.menus.fixedColumn') }}</div>
          <div class="vxe-tmpl-filter--menu-right-icon">
            <i class="vxe-icon-arrow-right"></i>
          </div>
          <div class="vxe-tmpl-filter--child-menu-group" :class="[`pos-${childMenuPos}`]">
            <ul class="vxe-tmpl-filter--child-menu-list">
              <li class="vxe-tmpl-filter--child-menu-item" :class="{'is-disabled': !column || !column.fixed}" @click="fixedColumn(null)">
                <div class="vxe-tmpl-filter--menu-left-icon">
                  <i class="vxe-icon-close"></i>
                </div>
                <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.cancelFixed') }}</div>
              </li>
              <li class="vxe-tmpl-filter--child-menu-item" :class="{'is-active': column && column.fixed === 'left'}" @click="fixedColumn('left')">
                <div class="vxe-tmpl-filter--child-menu-left-icon">
                  <i class="vxe-icon-check"></i>
                </div>
                <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.fixedLeft') }}</div>
              </li>
              <li class="vxe-tmpl-filter--child-menu-item" :class="{'is-active': column && !column.parentId && column.fixed === 'right'}" @click="fixedColumn('right')">
                <div class="vxe-tmpl-filter--child-menu-left-icon">
                  <i class="vxe-icon-check"></i>
                </div>
                <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.fixedRight') }}</div>
              </li>
            </ul>
          </div>
        </li>
      </ul>
      <ul v-if="option && showFilter" class="vxe-tmpl-filter--menu-group">
        <li v-if="!isMiniMenu" class="vxe-tmpl-filter--menu-item" :class="{'is-disabled': !hasFilter}" @click="resetFilterEvent({ $event })" @mouseenter="mouseenterEvent($event, 'reset')" @mouseleave="mouseleaveEvent($event)">
          <div class="vxe-tmpl-filter--menu-left-icon">
            <i class="vxe-icon-funnel-clear"></i>
          </div>
          <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.clearFilter') }}</div>
        </li>
        <li class="vxe-tmpl-filter--menu-item" :class="{'is-active': option.data.sMenu, 'is-hover': hoverMenu === 'filter'}" @mouseenter="mouseenterEvent($event, 'filter')" @mouseleave="mouseleaveEvent($event)">
          <div class="vxe-tmpl-filter--menu-left-icon">
            <i class="vxe-icon-funnel"></i>
          </div>
          <div class="vxe-tmpl-filter--menu-item-label">{{ filterBtnLabel }}</div>
          <div class="vxe-tmpl-filter--menu-right-icon">
            <i class="vxe-icon-arrow-right"></i>
          </div>
          <div class="vxe-tmpl-filter--child-menu-group" :class="[`pos-${childMenuPos}`]">
            <ul v-if="isMiniMenu" class="vxe-tmpl-filter--child-menu-list">
              <li class="vxe-tmpl-filter--menu-item" :class="{'is-disabled': !hasFilter}" @click="resetFilterEvent({ $event })">
                <div class="vxe-tmpl-filter--menu-left-icon">
                  <i class="vxe-icon-funnel-clear"></i>
                </div>
                <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.clearFilter') }}</div>
              </li>
            </ul>
            <ul class="vxe-tmpl-filter--child-menu-list" v-for="(cList, gIndex) in caseGroups" :key="gIndex">
              <li class="vxe-tmpl-filter--child-menu-item" v-for="(cItem, cIndex) in cList" :key="`${gIndex}_${cIndex}`" :class="{'is-active': option.data.sMenu === cItem.value}" @click="openCombinerEvent($event, cItem)">
                <div class="vxe-tmpl-filter--child-menu-left-icon">
                  <i class="vxe-icon-check"></i>
                </div>
                <div class="vxe-tmpl-filter--menu-item-label">{{ cItem.label }}</div>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
    <div v-if="option" class="combination-search">
      <div class="combination-search-header">
        <vxe-number-input v-if="isNumType" class="combination-search-input" v-model="option.data.sVal" v-bind="numInpProps" @change="searchEvent"></vxe-number-input>
        <vxe-input v-else class="combination-search-input" v-model="option.data.sVal" v-bind="txtInpProps" @change="searchEvent"></vxe-input>
      </div>
      <div class="combination-search-body">
        <template v-if="valList.length">
          <div class="combination-search-list-header">
            <div class="combination-search-item">
              <vxe-checkbox class="combination-search-checkbox" v-model="isAll" :indeterminate="isIndeterminate" @change="changeAllEvent" :content="getI18n('vxe.table.allTitle')"></vxe-checkbox>
            </div>
          </div>
          <div class="combination-search-list-body">
            <vxe-list :data="valList" :scroll-y="{gt: 20}" :height="searchHeight" auto-resize>
              <template #default="{ items }">
                <div class="combination-search-item" v-for="item in items" :key="item.key" :title="item.label">
                  <vxe-checkbox class="combination-search-checkbox" v-model="item.checked" @change="changeItemEvent" :content="item.label"></vxe-checkbox>
                </div>
              </template>
            </vxe-list>
          </div>
        </template>
        <template v-else>
          <div class="combination-search-body-empty" :style="{height: `${searchHeight + 26}px`}">{{ getI18n('vxe.renderer.combination.notData') }}</div>
        </template>
      </div>
    </div>
    <div class="combination-footer">
      <vxe-button size="mini" status="primary" @click="confirmFilterEvent" :disabled="!isVaildChecked">{{ getI18n('vxe.table.confirmFilter') }}</vxe-button>
      <vxe-button size="mini" @click="resetFilterEvent">{{ getI18n('vxe.table.resetFilter') }}</vxe-button>
    </div>
  </div>
</template>

<script lang="tsx">
import { defineComponent, PropType, nextTick } from 'vue'
import XEUtils from 'xe-utils'
import { VxeUI, VxeGlobalRendererHandles, VxeTableDefines, VxeColumnPropTypes, VxeComponentEventParams } from 'vxe-table'

/**
 * 通配符有3个，分别为?（问号）、*（星号）、~（波形符）
 * ?（问号）可代表任意单个字符；
 * *（星号）可代表任意数量的字符；
 * ~（波形符）后面可跟着 ?、* 、~ 分别用来查找 ?、*、 ~
 * 例如：'~?' 可查找到 '?'
 * 例如：'~*' 可查找到 '*'
 * 例如：'~~' 可查找到 '~'
 *
 * 参数：
 * filters=[{ data: { checks: [], sVal: '', sMenu: '', fType1: '', fVal1: '', fMode: 'and', fType2: '', fVal2: '' } }]
 *
 * 说明：
 * checks：勾选的单元格值列表
 * sVal: 搜索的值
 * sMenu: 选中的菜单
 * fType1: 第一个条件类型
 * fVal1: 第一个条件的值
 * fMode: 组合方式（与、或）
 * fType2: 第二个条件类型
 * fVal2: 第二个条件的值
 *
 * 参数：
 * filter-render={ name: 'FilterCombination', cellType: 'string', props: {} }
 *
 * 说明：
 * cellType: 单元格的类型（string字符串、number数值）
 * props：对应 vxe-input 配置项
 */
export default defineComponent({
  name: 'VxeTmplFilterCombination',
  props: {
    showFixed: Boolean,
    showSort: Boolean,
    showFilter: Boolean,
    renderParams: Object as PropType<VxeGlobalRendererHandles.RenderTableFilterParams>,
    renderOpts: Object as PropType<VxeGlobalRendererHandles.RenderTableFilterOptions>
  },
  data () {
    const { getI18nCases } = this
    return {
      isRenderStatus: false,
      hoverMenu: '' as string,
      childMenuPos: 'right',
      size: 'mini',
      column: null as VxeTableDefines.ColumnInfo | null,
      option: null as VxeTableDefines.FilterOption | null,
      isAll: false,
      isIndeterminate: false,
      hasFilter: false,
      searchHeight: 180,
      isMiniMenu: false,
      colValList: [] as any[],
      valList: [] as any[],
      textCaseGroups: [
        [
          { value: 'equal', label: getI18nCases('equal') },
          { value: 'unequal', label: getI18nCases('unequal') }
        ],
        [
          { value: 'begin', label: getI18nCases('begin') },
          { value: 'endin', label: getI18nCases('endin') }
        ],
        [
          { value: 'include', label: getI18nCases('include') },
          { value: 'exclude', label: getI18nCases('exclude') }
        ],
        [
          { value: 'custom', label: getI18nCases('custom') }
        ]
      ],
      numCaseGroups: [
        [
          { value: 'equal', label: getI18nCases('equal') },
          { value: 'unequal', label: getI18nCases('unequal') }
        ],
        [
          { value: 'gt', label: getI18nCases('gt') },
          { value: 'ge', label: getI18nCases('ge') },
          { value: 'lt', label: getI18nCases('lt') },
          { value: 'le', label: getI18nCases('le') },
          { value: 'between', label: getI18nCases('between') }
        ],
        [
          { value: 'custom', label: getI18nCases('custom') }
        ]
      ],
      dateCaseGroups: [
        [

          { value: 'equal', label: getI18nCases('equal') }
        ],
        [
          { value: 'before', label: getI18nCases('before') },
          { value: 'after', label: getI18nCases('after') },
          { value: 'between', label: getI18nCases('between') }
        ],
        [
          { value: 'tomorrow', label: getI18nCases('tomorrow') },
          { value: 'today', label: getI18nCases('today') },
          { value: 'yesterday', label: getI18nCases('yesterday') }
        ],
        [
          { value: 'nextWeek', label: getI18nCases('nextWeek') },
          { value: 'thisWeek', label: getI18nCases('thisWeek') },
          { value: 'lastWeek', label: getI18nCases('lastWeek') }
        ],
        [
          { value: 'nextMonth', label: getI18nCases('nextMonth') },
          { value: 'thisMonth', label: getI18nCases('thisMonth') },
          { value: 'lastMonth', label: getI18nCases('lastMonth') }
        ],
        [
          { value: 'nextYear', label: getI18nCases('nextYear') },
          { value: 'thisYear', label: getI18nCases('thisYear') },
          { value: 'lastYear', label: getI18nCases('lastYear') }
        ],
        [
          { value: 'yearToDate', label: getI18nCases('yearToDate') }
        ],
        [
          { value: 'custom', label: getI18nCases('custom') }
        ]
      ],
      defCaseList: [
        { value: 'equal', label: getI18nCases('equal') },
        { value: 'unequal', label: getI18nCases('unequal') },
        { value: 'gt', label: getI18nCases('gt') },
        { value: 'ge', label: getI18nCases('ge') },
        { value: 'lt', label: getI18nCases('lt') },
        { value: 'le', label: getI18nCases('le') },
        { value: 'begin', label: getI18nCases('begin') },
        { value: 'notbegin', label: getI18nCases('notbegin') },
        { value: 'endin', label: getI18nCases('endin') },
        { value: 'notendin', label: getI18nCases('notendin') },
        { value: 'include', label: getI18nCases('include') },
        { value: 'exclude', label: getI18nCases('exclude') }
      ],
      dateCaseList: [
        { value: 'equal', label: getI18nCases('equal') },
        { value: 'unequal', label: getI18nCases('unequal') },
        { value: 'isAfter', label: getI18nCases('isAfter') },
        { value: 'eqAfter', label: getI18nCases('eqAfter') },
        { value: 'isBefore', label: getI18nCases('isBefore') },
        { value: 'eqBefore', label: getI18nCases('eqBefore') }
      ],
      combiner: {
        type1: '',
        val1: '',
        mode: '',
        type2: '',
        val2: ''
      },
      menuleaveTime: null as any
    }
  },
  computed: {
    allowSortable (): boolean {
      const { renderParams } = this
      if (renderParams) {
        const { column } = renderParams
        return column.sortable
      }
      return false
    },
    isNumType (): boolean {
      const { renderOpts } = this
      return renderOpts ? renderOpts.cellType === 'number' : false
    },
    isDateType (): boolean {
      const { renderOpts } = this
      return renderOpts ? renderOpts.cellType === 'date' : false
    },
    filterBtnLabel (): string {
      const { isNumType, isDateType, getI18n } = this
      if (isNumType) {
        return getI18n('vxe.plugins.filterCombination.menus.numberOption')
      }
      if (isDateType) {
        return getI18n('vxe.plugins.filterCombination.menus.dateOption')
      }
      return getI18n('vxe.plugins.filterCombination.menus.textOption')
    },
    txtInpProps (): any {
      const { renderOpts, getI18n } = this
      const props = renderOpts ? (renderOpts.props || {}) : {}
      return {
        type: 'text',
        clearable: props.clearable || true,
        size: props.size || 'mini',
        placeholder: props.placeholder || getI18n('vxe.renderer.search'),
        suffixIcon: props.suffixIcon || 'vxe-icon-search'
      }
    },
    numInpProps (): any {
      const { renderOpts, getI18n } = this
      const props = renderOpts ? (renderOpts.props || {}) : {}
      return {
        type: 'number',
        clearable: props.clearable || true,
        size: props.size || 'mini',
        placeholder: props.placeholder || getI18n('vxe.renderer.search'),
        suffixIcon: props.suffixIcon || 'vxe-icon-search',
        controlConfig: props.controlConfig || {
          enabled: false
        }
      }
    },
    caseList (): any[] {
      if (this.isDateType) {
        return this.dateCaseList
      }
      return this.defCaseList
    },
    isVaildChecked (): boolean {
      const { valList, colValList } = this
      return valList.length > 0 && colValList.some(item => item.checked)
    },
    caseGroups (): any[] {
      if (this.isNumType) {
        return this.numCaseGroups
      }
      if (this.isDateType) {
        return this.dateCaseGroups
      }
      return this.textCaseGroups
    }
  },
  watch: {
    renderParams () {
      // 当点击不同列时刷新数据
      this.load()
    },
    colValList () {
      this.handleSearch()
    }
  },
  created () {
    this.load()
    this.handleSearch()
  },
  methods: {
    load () {
      const { renderOpts, renderParams, getI18n } = this
      if (renderOpts && renderParams) {
        const { options } = renderOpts
        const { $table, column } = renderParams
        const { fullData } = $table.getTableData()
        const option = column.filters[0]
        if (option) {
          const { checks } = option.data
          const colValMaps: {
          [key: string]: any
        } = {}
          const colValList: any[] = []
          if (options) {
            options.forEach((item, index) => {
              const { value, label } = item
              colValList.push({
                key: index,
                checked: checks.includes(value),
                value,
                label: XEUtils.eqNull(label) ? getI18n('vxe.renderer.combination.empty') : label
              })
            })
          } else {
            // fullData 根据全量的数据，生成可搜索的列表
            // visibleData 根据显示的数据，生成可搜索的列表
            fullData.forEach((item, index) => {
              const value = XEUtils.toValueString(XEUtils.get(item, column.field))
              if (!colValMaps[value]) {
                const cellLabel = $table.getCellLabel(item, column)
                const vItem = {
                  key: index,
                  checked: checks.includes(value),
                  value,
                  label: XEUtils.eqNull(cellLabel) ? getI18n('vxe.renderer.combination.empty') : cellLabel
                }
                if (value === '') {
                  colValList.unshift(vItem)
                } else {
                  colValList.push(vItem)
                }
                colValMaps[value] = item
              }
            })
          }
          // 将相关的信息记录
          this.column = column
          this.option = option
          this.colValList = colValList
          this.valList = colValList
          this.hasFilter = $table.isActiveFilterByColumn ? $table.isActiveFilterByColumn(column.field) : $table.isFilter(column.field)
          setTimeout(() => {
            this.updateStyle()
          }, 6)
        }
      }
    },
    async updateStyle () {
      this.isRenderStatus = true
      this.isMiniMenu = false
      this.searchHeight = 180
      await nextTick()
      const wrapperEl = this.$el
      const parentEl = wrapperEl ? wrapperEl.parentElement : null
      if (parentEl) {
        this.isMiniMenu = parentEl.clientHeight <= 340
        this.searchHeight = 180
        await nextTick()
        const overHeight = wrapperEl.clientHeight - parentEl.clientHeight
        if (overHeight > 0) {
          this.searchHeight = Math.max(40, this.searchHeight - overHeight)
        }
      }
      this.isRenderStatus = false
    },
    getI18n (key: string, args?: any) {
      return VxeUI.getI18n(key, args)
    },
    getI18nCases (type: string) {
      const { getI18n } = this
      return getI18n(`vxe.plugins.filterCombination.cases.${type}`)
    },
    handleSearch () {
      const { option, colValList } = this
      if (option) {
        this.valList = option.data.sVal ? colValList.filter(item => item.value.toLowerCase().indexOf(XEUtils.toValueString(option.data.sVal).toLowerCase()) > -1) : colValList
        this.updateCheckStatus()
      }
    },
    // 创建一个去抖函数，当用户搜索时，至少 500 毫秒才搜索，避免实时搜索卡顿
    searchEvent: XEUtils.debounce(function (this: any) {
      this.handleSearch()
    }, 500, { leading: false, trailing: true }),
    changeAllEvent () {
      const { isAll } = this
      this.valList.forEach(item => {
        item.checked = isAll
      })
      this.isIndeterminate = false
    },
    updateCheckStatus () {
      const { valList } = this
      const isAll = valList.every(item => item.checked)
      this.isAll = isAll
      this.isIndeterminate = !isAll && valList.some(item => item.checked)
    },
    changeItemEvent () {
      this.updateCheckStatus()
    },
    confirmFilterEvent ({ $event }: VxeComponentEventParams) {
      const { renderParams, option, valList } = this
      if (renderParams && option) {
        const { data } = option
        const { $table } = renderParams
        data.f1 = ''
        data.f2 = ''
        data.fType1 = ''
        data.fType2 = ''
        data.sMenu = ''
        data.checks = valList.filter(item => item.checked).map(item => item.value)
        // 改变当前选项
        $table.updateFilterOptionStatus(option, true)
        // 最后触发确认筛选按钮
        $table.saveFilterPanelByEvent($event)
      }
    },
    resetFilterEvent ({ $event }: { $event: Event }) {
      const { renderParams } = this
      if (renderParams) {
        const { $table } = renderParams
        // 触发筛选面板的重置事件，会自动将每个选项的值清空
        $table.resetFilterPanelByEvent($event)
      }
    },
    openCombinerEvent (evnt: Event, cItem: any) {
      const { size, renderParams, option, caseList, valList, combiner, isDateType, getI18n } = this
      if (renderParams && option) {
        const { $table, column } = renderParams
        const { data } = option
        const caseType = cItem.value === 'custom' ? (data.sMenu || cItem.value) : cItem.value
        // 处理默运算规则认值，当打开弹出框时，设置/校验默认值
        if (caseType !== data.sMenu) {
          data.fVal1 = ''
          data.fMode = 'and'
          data.fVal2 = ''
          data.fType2 = ''
        }
        switch (caseType) {
          case 'before':
            data.fType1 = 'isBefore'
            break
          case 'after':
            data.fType1 = 'isAfter'
            break
          case 'between':
            data.fType1 = isDateType ? 'eqAfter' : 'ge'
            data.fType2 = isDateType ? 'eqBefore' : 'le'
            break
          case 'custom':
            if (!data.fType1) {
              data.fType1 = 'equal'
            }
            break
          default:
            data.fType1 = caseType
        }
        combiner.type1 = data.fType1
        combiner.val1 = data.fVal1
        combiner.mode = data.fMode
        combiner.type2 = data.fType2
        combiner.val2 = data.fVal2
        if (combiner.type1 && !caseList.some(item => item.value=== combiner.type1)) {
          combiner.type1 = caseList[0].value
        }
        if (combiner.type2 && !caseList.some(item => item.value=== combiner.type2)) {
          combiner.type2 = caseList[0].value
        }
        // 当弹出打开时，将筛选面板手动关闭
        $table.closeFilter()
        if (['tomorrow', 'today', 'yesterday', 'nextWeek', 'thisWeek', 'lastWeek', 'nextMonth', 'thisMonth', 'lastMonth', 'nextYear', 'thisYear', 'lastYear', 'yearToDate'].includes(caseType)) {
          // 面板已被关闭，需手动设置
          (option as any)._checked = true
          option.checked = true
          // 手动触发筛选面板确认事件
          $table.saveFilterPanelByEvent(evnt)
          return
        }

        // 动态创建一个模态窗口
        VxeUI.modal.open({
          title: getI18n('vxe.renderer.combination.popup.title'),
          width: 620,
          minWidth: 460,
          minHeight: 240,
          resize: true,
          showFooter: true,
          showConfirmButton: true,
          showCancelButton: true,
          onShow ({ $modal }) {
            const { refElem } = $modal.getRefMaps()
            const $el = refElem.value
            const inputElem = ($el ? $el.querySelector('.combination-popup-filter-input .vxe-input--inner') : null) as HTMLElement
            // 当窗口显示时，将输入框自动聚焦
            if (inputElem) {
              inputElem.focus()
            }
          },
          slots: {
            default: () => {
              return [
                <div class="vxe-table-filter-combination-popup">
                  <div class="combination-popup-title">{ getI18n('vxe.renderer.combination.popup.currColumnTitle') }<span><span>{ column.title }</span></span></div>
                  <div class="combination-popup-filter">
                    <vxe-select class="combination-popup-filter-select" v-model={ combiner.type1 } size={ size } options={ caseList } transfer clearable></vxe-select>
                    {
                      isDateType ? <vxe-date-picker class="combination-popup-filter-input" v-model={ combiner.val1 } size={ size } clearable></vxe-date-picker> : <vxe-input class="combination-popup-filter-input" v-model={ combiner.val1 } size={ size } clearable></vxe-input>
                    }
                  </div>
                  <div class="combination-popup-concat">
                    <vxe-radio-group v-model={ combiner.mode } size={ size }>
                      <vxe-radio label="and" content={ getI18n('vxe.renderer.combination.popup.and') }></vxe-radio>
                      <vxe-radio label="or" content={ getI18n('vxe.renderer.combination.popup.or') }></vxe-radio>
                    </vxe-radio-group>
                  </div>
                  <div class="combination-popup-filter">
                    <vxe-select class="combination-popup-filter-select" v-model={ combiner.type2 } size={ size } options={ caseList } transfer clearable></vxe-select>
                    {
                      isDateType ? <vxe-date-picker class="combination-popup-filter-input" v-model={ combiner.val2 } size={ size } clearable></vxe-date-picker> : <vxe-input class="combination-popup-filter-input" v-model={ combiner.val2 } size={ size } clearable></vxe-input>
                    }
                  </div>
                  <div class="combination-popup-describe">
                    <span innerHTML={ getI18n('vxe.renderer.combination.popup.describeHtml') }></span>
                  </div>
                </div>
              ]
            },
            footer: ({ $modal }) => {
              return <div class="combination-popup-footer">
                <vxe-button status="primary" onClick={
                  (evnt: MouseEvent) => {
                    valList.forEach(item => {
                      item.checked = false
                    })

                    // 设置参数
                    data.fType1 = combiner.type1
                    data.fVal1 = combiner.val1
                    data.fMode = combiner.mode
                    data.fType2 = combiner.type2
                    data.fVal2 = combiner.val2
                    data.sMenu = cItem.value
                    data.checks = [] as any[]

                    // 面板已被关闭，需手动设置
                    (option as any)._checked = true
                    option.checked = true

                    // 调用关闭窗口方法
                    $modal.close()

                    // 手动触发筛选面板确认事件
                    $table.saveFilterPanelByEvent(evnt)
                  }
                }>{ getI18n('vxe.button.confirm') }</vxe-button>
                <vxe-button onClick={
                  () => {
                    // 调用关闭窗口方法
                    $modal.close()
                  }
                }>{ getI18n('vxe.button.cancel') }</vxe-button>
              </div>
            }
          }
        })
      }
    },
    sortColumn (evnt: Event, order: any) {
      const { allowSortable, renderParams } = this
      if (renderParams) {
        const { $table, column } = renderParams
        if (allowSortable) {
          // 关闭筛选面板
          $table.closeFilter()
          // 手动调用表格排序方法
          $table.setSortByEvent(evnt, { field: column.field, order: column.order === order ? null : order })
        }
      }
    },
    clearSort (evnt: Event) {
      const { renderParams } = this
      if (renderParams) {
        const { $table, column } = renderParams
        // 关闭筛选面板
        $table.closeFilter()
        $table.clearSortByEvent(evnt, column)
      }
    },
    fixedColumn (fixed: VxeColumnPropTypes.Fixed) {
      const { renderParams } = this
      if (renderParams) {
        const { $table, column } = renderParams
        if (fixed) {
          $table.setColumnFixed(column, fixed)
        } else {
          $table.clearColumnFixed(column)
        }
        $table.closeFilter()
      }
    },
    mouseenterEvent (evnt: MouseEvent, menuType: string) {
      this.childMenuPos = 'right'
      this.hoverMenu = menuType
      const menuElem = evnt.currentTarget as HTMLDivElement
      if (menuElem.className.indexOf('is-disabled') === -1) {
        const childMenuElem = menuElem.querySelector('.vxe-tmpl-filter--child-menu-group')
        clearTimeout(this.menuleaveTime)
        menuElem.setAttribute('_active', '1')
        if (childMenuElem) {
          this.$nextTick(() => {
            const visibleWidth = document.documentElement.clientWidth || document.body.clientWidth
            const bounding = childMenuElem.getBoundingClientRect()
            if (bounding.left + childMenuElem.clientWidth + 20 > visibleWidth) {
              this.childMenuPos = 'left'
            }
          })
        }
      } else {
        this.hoverMenu = ''
        menuElem.removeAttribute('_active')
      }
    },
    mouseleaveEvent (evnt: MouseEvent) {
      const menuElem = evnt.currentTarget as HTMLDivElement
      const childMenuElem = menuElem.querySelector('.vxe-tmpl-filter--child-menu-group')
      menuElem.removeAttribute('_active')
      if (childMenuElem) {
        this.menuleaveTime = setTimeout(() => {
          if (!menuElem.hasAttribute('_active')) {
            this.hoverMenu = ''
          }
        }, 250)
      } else {
        this.hoverMenu = ''
      }
    }
  }
})
</script>

<style lang="scss">
.vxe-table-filter-combination {
  &.is--cloak {
    visibility: hidden;
  }
  .vxe-tmpl-filter--menu-group {
    position: relative;
    margin: 0;
    padding: 0;
    list-style: none;
    user-select: none;
  }
  .vxe-tmpl-filter--menu-item,
  .vxe-tmpl-filter--child-menu-item {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 2.28em;
    line-height: 2.28em;
    padding: 0 0.5em;
  }
  .vxe-tmpl-filter--menu-item {
    &:not(.is-disabled) {
      cursor: pointer;
      &:hover {
        background-color: var(--vxe-ui-table-row-hover-background-color, #f5f7fa);
      }
    }
    &.is-disabled {
      cursor: no-drop;
      color: var(--vxe-ui-font-disabled-color, #464646);
    }
    &.is-hover {
      background-color: var(--vxe-ui-table-row-hover-background-color, #f5f7fa);
      .vxe-tmpl-filter--child-menu-group {
        display: block;
      }
    }
    &.is-active {
      & > .vxe-tmpl-filter--menu-left-icon {
        color: var(--vxe-ui-font-primary-color, #409eff);
      }
    }
  }
  .vxe-tmpl-filter--menu-item-label {
    flex-grow: 1;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .vxe-tmpl-filter--menu-item {
    &:last-child {
      & > .vxe-tmpl-filter--menu-item-label,
      & > .vxe-tmpl-filter--menu-right-icon {
        border-bottom: 1px solid var(--vxe-ui-base-popup-border-color, #DADCE0);
      }
    }
  }
  .vxe-tmpl-filter--child-menu-item {
    &:last-child {
      & > .vxe-tmpl-filter--menu-item-label {
        border-bottom: 1px solid var(--vxe-ui-base-popup-border-color, #DADCE0);
      }
    }
  }
  .vxe-tmpl-filter--child-menu-list {
    &:last-child {
      & > .vxe-tmpl-filter--child-menu-item {
        & > .vxe-tmpl-filter--menu-item-label {
          border-bottom: 0;
        }
      }
    }
  }
  .vxe-tmpl-filter--child-menu-group {
    display: none;
    position: absolute;
    top: 0;
    width: 150px;
    background-color: var(--vxe-ui-layout-background-color, #ffffff);
    border: 1px solid var(--vxe-ui-base-popup-border-color, #DADCE0);
    box-shadow: var(--vxe-ui-base-popup-box-shadow, 0 0 10px 0 rgba(0, 0, 0, 0.16));
    &.pos-left {
      left: -150px;
    }
    &.pos-right {
      right: -150px;
    }
  }
  .vxe-tmpl-filter--child-menu-list {
    position: relative;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .vxe-tmpl-filter--child-menu-item {
    position: relative;
    &:not(.is-disabled) {
      &:hover {
        background-color: var(--vxe-ui-table-row-hover-background-color, #f5f7fa);
      }
    }
    &.is-disabled {
      cursor: no-drop;
      color: var(--vxe-ui-font-disabled-color, #464646);
    }
    &.is-active {
      .vxe-tmpl-filter--child-menu-left-icon {
        color: var(--vxe-ui-font-primary-color, #409eff);
        visibility: visible;
      }
    }
  }
  .vxe-tmpl-filter--child-menu-left-icon {
    visibility: hidden;
  }
  .vxe-tmpl-filter--child-menu-left-icon,
  .vxe-tmpl-filter--menu-left-icon {
    text-align: center;
    width: 1.6em;
    flex-shrink: 0;
  }
  .vxe-tmpl-filter--menu-right-icon {
    text-align: center;
    flex-shrink: 0;
  }
}

.vxe-table-filter-combination {
  width: 240px;
  user-select: none;
  .combination-search {
    display: flex;
    flex-direction: column;
    overflow: auto;
    padding: 0.5em 0.5em 0.5em 2.1em;
  }
  .combination-search-header {
    flex-shrink: 0;
    position: relative;
  }
  .combination-search-input {
    width: 100%;
  }
  .combination-search-body {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    border: 1px solid var(--vxe-ui-table-border-color, #e8eaec);
    border-radius: 4px;
    margin-top: 0.5em;
  }
  .combination-search-list-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 26px;
    flex-shrink: 0;
    background-color: var(--vxe-ui-table-header-background-color, #f8f8f9);
    border-bottom: 1px solid var(--vxe-ui-table-border-color, #e8eaec);
    .combination-search-item {
      width: 100%;
    }
  }
  .combination-search-list-body {
    .vxe-list--virtual-wrapper {
      height: 120px;
    }
    .combination-search-item {
      &:hover {
        background-color: var(--vxe-ui-table-row-hover-background-color);
      }
    }
  }
  .combination-search-item {
    display: block;
    height: 24px;
    line-height: 20px;
    padding: 0 10px;
  }
  .combination-search-checkbox {
    width: 100%;
    .vxe-checkbox--label {
      max-width: calc(100% - 1.3em);
    }
  }
  .combination-search-body-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .combination-footer {
    text-align: right;
    padding: 0 10px 10px 0;
  }
}
.vxe-table-filter-combination-popup {
  .combination-popup-title {
    padding: 0 5px 5px 0;
    & > span {
      position: relative;
      display: block;
      padding-left: 15px;
      padding: 0 0 0 15px;
      font-size: 12px;
      line-height: 22px;
      height: 22px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      & > span {
        padding-right: 5px;
      }
      &:after {
        content: "";
        position: absolute;
        width: 100%;
        left: 30px;
        top: 50%;
        border-bottom: 1px solid var(--vxe-ui-table-border-color, #e8eaec);;
        z-index: -1;
      }
    }
  }
  .combination-popup-filter {
    display: flex;
    flex-direction: row;
    padding-left: 22px;
  }
  .combination-popup-filter-select {
    flex-shrink: 0;
    min-width: 120px;
    width: 32%;
  }
  .combination-popup-filter-input {
    margin-left: 15px;
    flex-grow: 1;
  }
  .combination-popup-describe {
    font-size: 12px;
    padding: 16px 0 5px 0;
  }
  .combination-popup-concat {
    padding: 0 5px 5px 40px;
  }
  .combination-popup-footer {
    text-align: right;
  }
}
</style>
