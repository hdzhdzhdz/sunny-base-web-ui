<template>
  <div class="vxe-table-filter-complex-input" :class="{'is--types': showTypes}">
    <ul class="vxe-tmpl-filter--menu-group">
      <li class="vxe-tmpl-filter--menu-item" :class="{'is-disabled': !hasSortable, 'is-active': column && column.order === 'asc'}" @click="sortColumn($event, 'asc')" @mouseenter="mouseenterEvent($event, 'ascSort')" @mouseleave="mouseleaveEvent($event)">
        <div class="vxe-tmpl-filter--menu-left-icon">
          <i :class="[isNumType ? 'vxe-icon-sort-numeric-asc' : 'vxe-icon-sort-alpha-asc']"></i>
        </div>
        <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.sortAsc') }}</div>
      </li>
      <li class="vxe-tmpl-filter--menu-item" :class="{'is-disabled': !hasSortable, 'is-active': column && column.order === 'desc'}" @click="sortColumn($event, 'desc')" @mouseenter="mouseenterEvent($event, 'descSort')" @mouseleave="mouseleaveEvent($event)">
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
    <ul class="vxe-tmpl-filter--menu-group">
      <li class="vxe-tmpl-filter--menu-item" :class="{'is-active': column && column.fixed, 'is-hover': hoverMenu === 'fixed'}" @mouseenter="mouseenterEvent($event, 'fixed')" @mouseleave="mouseleaveEvent($event)">
        <div class="vxe-tmpl-filter--menu-left-icon">
          <i class="vxe-icon-swap"></i>
        </div>
        <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n(column && column.parentId ? 'vxe.renderer.combination.menus.fixedGroup' : 'vxe.renderer.combination.menus.fixedColumn') }}</div>
        <div class="vxe-tmpl-filter--menu-right-icon">
          <i class="vxe-icon-arrow-right"></i>
        </div>
        <div class="vxe-tmpl-filter--child-menu-group" :class="[`pos-${childMenuPos}`]">
          <ul class="vxe-tmpl-filter--child-menu-list">
            <li class="vxe-tmpl-filter--child-menu-item" :class="{'is-disabled': !column || !column.fixed}" @click="fixedColumn(null)">
              <div class="vxe-tmpl-filter--child-menu-left-icon"></div>
              <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.cancelFixed') }}</div>
            </li>
            <li class="vxe-tmpl-filter--child-menu-item" :class="{'is-active': column && column.fixed === 'left'}" @click="fixedColumn('left')">
              <div class="vxe-tmpl-filter--child-menu-left-icon">
                <i class="vxe-icon-check"></i>
              </div>
              <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.fixedLeft') }}</div>
            </li>
            <li class="vxe-tmpl-filter--child-menu-item" :class="{'is-active': column && column.fixed === 'right'}" @click="fixedColumn('right')">
              <div class="vxe-tmpl-filter--child-menu-left-icon">
                <i class="vxe-icon-check"></i>
              </div>
              <div class="vxe-tmpl-filter--menu-item-label">{{ getI18n('vxe.renderer.combination.menus.fixedRight') }}</div>
            </li>
          </ul>
        </div>
      </li>
    </ul>
    <div v-if="option" class="complex-input-search">
      <div v-if="showTypes" class="complex-input-types">
        <vxe-radio-group class="complex-radio-group" v-model="option.data.sType">
          <vxe-radio v-for="item in caseList" :key="item.value" :label="item.value" :content="getI18n(item.label)"></vxe-radio>
        </vxe-radio-group>
      </div>
      <div class="complex-input-inner">
        <vxe-number-input v-if="isNumType" class="complex-input-input" v-model="option.data.sVal" v-bind="numInpProps" @keydown="keydownEvent"></vxe-number-input>
        <vxe-input v-else class="complex-input-input" v-model="option.data.sVal" v-bind="txtInpProps" @keydown="keydownEvent"></vxe-input>
      </div>
      <div v-if="!isNumType" class="complex-input-case">
        <vxe-checkbox v-model="option.data.isSensitive">{{ getI18n('vxe.renderer.cases.isSensitive') }}</vxe-checkbox>
      </div>
    </div>
    <div class="complex-input-footer">
      <vxe-button size="mini" status="primary" @click="confirmEvent">{{ getI18n('vxe.table.confirmFilter') }}</vxe-button>
      <vxe-button size="mini" @click="resetEvent">{{ getI18n('vxe.table.resetFilter') }}</vxe-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { VxeUI, VxeGlobalRendererHandles, VxeTableDefines, VxeColumnPropTypes, VxeTablePropTypes, VxeComponentEventParams } from 'vxe-table'

/**
 * vxe-table-filters-complex-input4.1.0
 *
 * 参数：
 * filters=[{data: {sType: 'include', sVal: '', isSensitive: false}}]"
 *
 * 说明：
 * sType: 筛选类型（incl包含、eq等于、gt大于、lt小于）
 * sVal：搜索的值
 * isSensitive：是否区分大小写
 *
 * 参数：
 * filter-render={ name: 'FilterComplexInput', cellType: 'string', props: {} }
 *
 * 说明：
 * cellType: 单元格的类型（string字符串、number数值）
 * props：对应 vxe-input 配置项
 */
export default defineComponent({
  name: 'VxeTmplFilterComplexInput',
  props: {
    showTypes: Boolean,
    renderParams: Object as PropType<VxeGlobalRendererHandles.RenderFilterParams>,
    renderOpts: Object as PropType<VxeGlobalRendererHandles.RenderFilterOptions>
  },
  data () {
    return {
      hoverMenu: '',
      childMenuPos: 'right',
      size: 'mini',
      column: null as VxeTableDefines.ColumnInfo | null,
      option: null as VxeTableDefines.FilterOption | null,
      // 计算规则列表
      textCaseList: [
        { value: 'include', label: 'vxe.renderer.cases.include' },
        { value: 'equal', label: 'vxe.renderer.cases.equal' },
        { value: 'begin', label: 'vxe.renderer.cases.begin' },
        { value: 'endin', label: 'vxe.renderer.cases.endin' }
      ],
      numCaseList: [
        { value: 'include', label: 'vxe.renderer.cases.include' },
        { value: 'equal', label: 'vxe.renderer.cases.equal' },
        { value: 'gt', label: 'vxe.renderer.cases.gt' },
        { value: 'lt', label: 'vxe.renderer.cases.lt' }
      ],
      menuleaveTime: null as any
    }
  },
  computed: {
    hasSortable (): boolean {
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
    txtInpProps (): any {
      const { renderOpts, getI18n } = this
      return Object.assign({
        type: 'text',
        clearable: true,
        size: 'mini',
        placeholder: getI18n('vxe.renderer.search'),
        suffixIcon: 'vxe-icon-search'
      }, renderOpts ? renderOpts.props : {})
    },
    numInpProps (): any {
      const { renderOpts, getI18n } = this
      return Object.assign({
        type: 'number',
        clearable: true,
        size: 'mini',
        placeholder: getI18n('vxe.renderer.search'),
        suffixIcon: 'vxe-icon-search',
        controlConfig: {
          enabled: false
        }
      }, renderOpts ? renderOpts.props : {})
    },
    caseList (): {
      value: string;
      label: string;
    }[] {
      return this.isNumType ? this.numCaseList : this.textCaseList
    }
  },
  watch: {
    renderParams () {
      // 当点击不同列时刷新数据
      this.load()
    }
  },
  created () {
    this.load()
  },
  methods: {
    load () {
      const { renderParams } = this
      if (renderParams) {
        const { column } = renderParams
        const option = column.filters[0]
        if (option) {
        // 将相关的信息记录
          this.column = column
          this.option = option
        }
      }
    },
    getI18n (key: string, args?: any) {
      return VxeUI.getI18n(key, args)
    },
    keydownEvent (params: VxeComponentEventParams & { $event: KeyboardEvent }) {
      const { $event } = params
      const { renderOpts } = this
      if (renderOpts) {
        const { events } = renderOpts
        // 如果按下回车键，则触发确认筛选事件
        if ($event.keyCode === 13) {
          this.confirmEvent(params)
        }
        // 回调自定义的事件
        if (events) {
          if (events.keydown) {
            events.keydown(params)
          }
        }
      }
    },
    confirmEvent ({ $event }: VxeComponentEventParams) {
      const { renderParams, option } = this
      if (renderParams && option) {
        const { $table } = renderParams
        option.data._sVal = option.data.sVal
        // 改变当前选项
        $table.updateFilterOptionStatus(option, true)
        // 最后触发确认筛选事件
        $table.saveFilterPanelByEvent($event)
      }
    },
    resetEvent ({ $event }: VxeComponentEventParams) {
      const { renderParams } = this
      if (renderParams) {
        const { $table } = renderParams
        // 触发筛选面板重置事件
        $table.resetFilterPanelByEvent($event)
      }
    },
    sortColumn (evnt: Event, order: VxeTablePropTypes.SortOrder) {
      const { hasSortable, renderParams } = this
      if (renderParams) {
        const { $table, column } = renderParams
        if (hasSortable) {
          // 关闭筛选面板
          $table.closeFilter()
          // 调用表格手动排序方法
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
.vxe-table-filter-complex-input {
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
    width: 2em;
    flex-shrink: 0;
  }
  .vxe-tmpl-filter--menu-right-icon {
    text-align: center;
    flex-shrink: 0;
  }
}
.vxe-table-filter-complex-input {
  width: 250px;
  &.is--types {
    width: 320px;
  }
  .complex-input-search {
    padding: 0 0.5em 0.5em 2.5em;
  }
  .complex-input-types {
    .complex-radio-group {
      & > label {
        margin: 0 0.4em 0.5em 0;
      }
      .vxe-radio--label {
        padding-left: 0.4em;
      }
    }
    & + .complex-input-inner {
      margin: 0;
    }
  }
  .complex-input-input {
    width: 100%;
  }
  .complex-input-types,
  .complex-input-inner,
  .complex-input-case {
    margin-top: 0.5em;
  }
  .complex-input-case {
    height: 26px;
  }
  .complex-input-footer {
    text-align: right;
    padding: 0 0.5em 0.5em 2.5em;
  }
}
</style>
