import { VxeUI } from 'vxe-pc-ui'
import FilterComplex from './FilterComplex.vue'

// 创建自定义筛选渲染器
VxeUI.renderer.add('MyFilterComplex', {
  // 不显示底部按钮，使用自定义的按钮
  showTableFilterFooter: false,
  // @ts-ignore 自定义筛选模板
  renderTableFilter (h, renderOpts, renderParams) {
    return <FilterComplex renderOpts={ renderOpts } renderParams={ renderParams } />
  },
})
