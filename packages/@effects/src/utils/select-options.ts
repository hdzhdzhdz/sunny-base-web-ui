export interface SelectOption {
  label: string
  value: string
  cArea?: string[]
  cMeta?: Record<string, any>
  defaultMeta?: string
}

export interface BusinessOpts {
  [key: string]: SelectOption[]
}

export interface SelectOptions extends Record<string, SelectOption[]> {}

const systemOpts: Record<string, SelectOption[]> = {
  systemOpts: [],
  menuType: [
    { label: "菜单", value: "1" },
    { label: "外链", value: "4" },
    { label: "弹窗", value: "5" },
    { label: "iframe", value: "6" }
  ],
  searchFormLg: [
    { label: "一行四列", value: "6" },
    { label: "一行三列", value: "8" },
    { label: "一行二列", value: "12" }
  ],
  templateList: [
    {
      label: "Form + Table 查询页",
      value: "0",
      cArea: ["searchForm", "searchTable"]
    },
    {
      label: "tabs 标签页",
      value: "1",
      defaultMeta:
        '[{"label":"标签1","name":"tab1","cArea":[{"label":"标签1表单","value":"tab1Form","type":"form"},{"label":"标签1表格","value":"tab1Table","type":"table"}]},{"label":"标签2","name":"tab2","cArea":[{"type":"form","label":"标签2表单","value":"tab2Form"},{"type":"table","label":"标签2表格","value":"tab2Table"}]},{"label":"标签3","name":"tab3","cArea":[{"label":"标签3表单","value":"tab3Form","type":"form"},{"label":"标签3表格","value":"tab3Table","type":"table"}]}]'
    },
    {
      label: "Form",
      value: "2",
      cArea: ["form"]
    },
    {
      label: "Form + Table(可编辑)",
      value: "3",
      cArea: ["form", "table"]
    },
    {
      label: "Form + Tabs",
      value: "4",
      defaultMeta:
        '[{"label": "标签1","name": "tab1Table","type": "table"},{"label": "标签2","name": "tab2Table","type": "table"}]'
    },
    { label: "自定义模板", value: "-1" }
  ],
  FormFieldTypes: [
    // { label: "span(文本)", value: "span" },
    { label: "Input(输入框)", value: "Input" },
    { label: "InputPassword(密码输入框)", value: "InputPassword" },
    { label: "InputNumber(数字输入框)", value: "InputNumber" },
    { label: "Textarea(多行文本框)", value: "Textarea" },
    { label: "Select(单项选择器)", value: "Select" },
    { label: "Checkbox(复选框)", value: "Checkbox" },
    { label: "CheckboxGroup(复选框组)", value: "CheckboxGroup" },
    { label: "Radio(单选框)", value: "Radio" },
    { label: "RadioGroup(单选框组)", value: "RadioGroup" },
    { label: "Switch(开关)", value: "Switch" },
    { label: "Cascader(级联选择器)", value: "Cascader" },
    { label: "DatePicker(日期选择器)", value: "DatePicker" },
    { label: "RangePicker(日期选择器)", value: "RangePicker" },
    { label: "TimePicker(日期选择器)", value: "TimePicker" },
    { label: "Upload(文件上传)", value: "Upload" },
    { label: "SunnyBusinessSearch(业务搜索组件)", value: "SunnyBusinessSearch" },
    { label: "Slot(自定义内容)", value: "Slot" }
  ],
  TableFieldTypes: [
    { label: "span(文本)", value: "span" },
    { label: "spanselect(选项筛选)", value: "spanselect" },
    // { label: "spandate(日期文本)", value: "spandate" },
  ],
  EditColumnTypes: [
    { label: "input(输入框)", value: 'InputRender' },
    { label: "inputNumber(数字输入框)", value: 'InputNumberRender' },
    { label: "select(选择框)", value: 'SelectRender' },
    { label: "datePicker(日期选择器)", value: 'DatePickerRender' },
    { label: "monthPicker(月份选择器)", value: 'MonthPickerRender' },
    { label: "yearPicker(年份选择器)", value: 'YearPickerRender' },
    { label: "weekPicker(周选择器)", value: 'WeekPickerRender' },
    { label: "rangePicker(日期范围选择器)", value: 'RangePickerRender' },
    { label: "switch(开关)", value: 'SwitchRender' },
    { label: "inputRange(区间输入框)", value: 'InputRangeRender' },
    { label: "textarea(多行文本框)", value: 'TextareaRender' },
    { label: "businessSearch(业务搜索)", value: 'BusinessSearchRender' }
  ],
  NewTableFieldTypes: [
    { label: "span(文本)", value: "span" },
    { label: "spanselect(选项筛选)", value: "spanselect" },
    { label: "spandate(日期文本)", value: "spandate" },
    { label: "Input(输入框)", value: "Input" },
    { label: "InputSearch(放大镜输入框)", value: "InputSearch" },
    { label: "Autocomplete(建议输入框)", value: "Autocomplete" },
    { label: "Select(单项选择器)", value: "Select" },
    { label: "RadioGroup(单选框)", value: "RadioGroup" },
    { label: "Checkbox(多选框)", value: "Checkbox" },
    { label: "Switch(开关)", value: "Switch" },
    {
      label: "date(日期选择)",
      value: "date",
      cMeta: {
        components: "DatePicker",
        type: "date",
        valueFormat: "yyyy-MM-dd"
      }
    },
    {
      label: "datetime(日期时间选择)",
      value: "datetime",
      cMeta: {
        components: "DatePicker",
        type: "date",
        valueFormat: "yyyy-MM-dd HH:mm:ss"
      }
    },
    {
      label: "daterange(日期区间选择)",
      value: "daterange",
      cMeta: {
        components: "DatePicker",
        type: "daterange",
        valueFormat: "yyyy-MM-dd"
      }
    },
    {
      label: "datetimerange(日期时间区间)",
      value: "datetimerange",
      cMeta: {
        components: "DatePicker",
        type: "datetimerange",
        valueFormat: "yyyy-MM-dd HH:mm:ss"
      }
    },
    {
      label: "month(月份选择)",
      value: "month",
      cMeta: {
        components: "DatePicker",
        type: "month",
        valueFormat: "yyyy-MM"
      }
    },
    {
      label: "monthrange(月份区间选择)",
      value: "monthrange",
      cMeta: {
        components: "DatePicker",
        type: "monthrange",
        valueFormat: "yyyy-MM"
      }
    },
    {
      label: "year(年份选择)",
      value: "year",
      cMeta: { components: "DatePicker", type: "year", valueFormat: "yyyy" }
    },
    { label: "Index(行序号，不传后端值)", value: "Index" },
    { label: "Slot(自定义内容)", value: "Slot" }
  ],
  selectType: [
    { label: "数据字典", value: "0" },
    { label: "select-options", value: "1" },
    { label: "自定义下拉", value: "3" },
    { label: "其他权限", value: "4" }
  ],
  signOpts: [
    { label: "禁用", value: "0" },
    { label: "启用", value: "1" }
  ],
  showOpts: [
    { label: "显示", value: "0" },
    { label: "隐藏", value: "1" }
  ],
  alignOpts: [
    { label: "left", value: "left" },
    { label: "right", value: "right" },
    { label: "center", value: "center" }
  ],
  requiredOpts: [
    { label: "校验", value: "0" },
    { label: "不校验", value: "1" }
  ],
  authOpts: [
    { label: "禁用", value: "0" },
    { label: "启用", value: "1" }
  ],
  sjzdSignOpts: [
    { label: "启用", value: "10001" },
    { label: "禁用", value: "10002" }
  ],
  sfggOpts: [
    { label: "私有", value: "0" },
    { label: "公共", value: "1" }
  ],
  cbTypeOpts: [
    { label: "SQL", value: "0" },
    { label: "自定义实现", value: "1" }
  ],
  nLikematchOpts: [
    { label: "完全模糊", value: "0" },
    { label: "前缀模糊", value: "1" },
    { label: "精确", value: "2" }
  ],
  nCbtypeOpts: [
    { label: "SQL", value: "0" },
    { label: "自定义实现", value: "1" }
  ],
  zdyxlkType: [
    { label: "下拉框", value: "0" },
    { label: "可搜索下拉框", value: "1" }
  ],
  userYhlxOpts: [
    { label: "普通用户", value: "0" },
    { label: "超级用户", value: "1" }
  ],
  userSfqyOpts: [
    { label: "启用", value: "0" },
    { label: "禁用", value: "1" }
  ],
  errorCodeType: [
    { label: "框架类报错", value: "0" },
    { label: "业务主动报错", value: "1" },
    { label: "数据库捕获报错", value: "2" },
    { label: "通用提示", value: "3" },
    { label: "暂无编码", value: "-1" },
    { label: "前端业务消息", value: "4" },
    { label: "前端通用消息", value: "5" }
  ],
  buildInType: [
    { label: "框架类报错", value: "0" },
    { label: "业务主动报错", value: "1" },
    { label: "前端消息", value: "4" }
  ],
  i18nLockOpts: [
    { label: "未锁定", value: "0" },
    { label: "锁定", value: "1" }
  ],
  i18nTypeOpts: [
    { label: "菜单", value: "1" },
    { label: "按钮", value: "2" },
    { label: "字段", value: "3" },
    { label: "超链接", value: "4" },
    { label: "静态资源", value: "5" },
    { label: "后台报错", value: "6" },
    { label: "kunkka翻译包", value: "7" },
    { label: "模块自定义国际化", value: "8" }
  ],
  nCbtype: [
    { label: "后端SQL", value: "0" },
    { label: "自定义实现", value: "1" }
  ],
  nBillOpts: [
    { label: "单据号(单据号+模块ID查询)", value: "1" },
    { label: "单据号(单据号查询)", value: "2" },
    { label: "表名-ID值(表名-ID值查询)", value: "3" }
  ],
  nYesNo: [
    { label: "否", value: "0" },
    { label: "是", value: "1" }
  ],
  directivesOpts: [
    { label: "正整数（0-9）", value: "number-integer" },
    { label: "保留2位小数", value: "number-decimal" },
    { label: "保留3位小数", value: "number-three-decimal" },
    {
      label: "英文(默认转大写)、数字、-_符号组成",
      value: "number-a-z-toUpperCase"
    }
  ],
  logicalOperator: [
    { label: "且", value: "&&" },
    { label: "或", value: "||" }
  ],
  comparisonOperator: [
    { label: "等于（==）", value: "==" },
    { label: "严格等于（===）", value: "===" },
    { label: "不等于（!=）", value: "!=" },
    { label: "不严格等于（!==）", value: "!==" },
    { label: "小于（<）", value: "<" },
    { label: "小于等于（<=）", value: "<=" },
    { label: "大于（>）", value: ">" },
    { label: "大于等于（>=）", value: ">=" }
  ],
  callmethodType: [
    { label: "导入", value: "导入" },
    { label: "导出", value: "导出" }
  ],
  customType: [
    { label: "是", value: "是" },
    { label: "否", value: "否" }
  ],
  exportType: [
    { label: "流式导出", value: "流式导出" },
    { label: "一次性批量导出", value: "一次性批量导出" },
    { label: "自定义格式导出", value: "自定义格式导出" }
  ],
  scheduleType: [
    { label: '无', value: 'NONE' },
    { label: 'CRON', value: 'CRON' },
    { label: '固定速度', value: 'FIX_RATE' }
  ],
  glueType: [
    { label: 'BEAN', value: 'BEAN' },
    { label: 'GLUE(Java)', value: 'GLUE_GROOVY' },
    { label: 'GLUE(Shell)', value: 'GLUE_SHELL' },
    { label: 'GLUE(Python)', value: 'GLUE_PYTHON' },
    { label: 'GLUE(PHP)', value: 'GLUE_PHP' },
    { label: 'GLUE(Nodejs)', value: 'GLUE_NODEJS' },
    { label: 'GLUE(PowerShell)', value: 'GLUE_POWERSHELL' }
  ],
  triggerStatus: [
    { label: '停止', value: '0' },
    { label: '运行', value: '1' }
  ],
  logStatus: [
    { label: '全部', value: '-1' },
    { label: '成功', value: '1' },
    { label: '失败', value: '2' },
    { label: '运行中', value: '3' }
  ],
  triggerCode: [
    { label: '成功', value: '200' },
    { label: '失败', value: '500' },
    { label: '空', value: '0' }
  ],
  handleCode: [
    { label: '成功', value: '200' },
    { label: '失败', value: '500' },
    { label: '失败(超时)', value: '502' }
  ],
  zcfsOpts: [
    { label: '自动注册', value: '0' },
    { label: '手动录入', value: '1' }
  ],
  formBtnOpts: [
    { label: 'insertFooter', value: 'insertFooter' },
    { label: 'centerFooter', value: 'centerFooter' },
    { label: 'appendFooter', value: 'appendFooter' },
    { label: 'footer', value: 'footer' }
  ]
}

const businessOpts: BusinessOpts = {}

export default { ...systemOpts, ...businessOpts } as SelectOptions
