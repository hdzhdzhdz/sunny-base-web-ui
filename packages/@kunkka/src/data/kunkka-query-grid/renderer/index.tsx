import { VxeUI } from 'vxe-table'
import FilterComplex from './FilterComplex.vue'

// 创建自定义筛选渲染器
VxeUI.renderer.add('MyFilterComplex', {
  // 不显示底部按钮，使用自定义的按钮
  showTableFilterFooter: false,
  // 自定义筛选模板
  renderTableFilter (renderOpts, renderParams) {
    return <FilterComplex renderOpts={ renderOpts } renderParams={ renderParams } />
  },
})
