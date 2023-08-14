import { RangeCase, TimeUnit } from '../base'

export type CommonConfig = {
  /**
   * 对于需要使用预制数据的dateType必传，如Select，Cascader等组件的options来自预制数据
   */
  presetKey?: string

  /**
   * 用于前后端通信的时间单位，当dateType为时间类型时有效
   */
  valueUnit?: TimeUnit

  /**
   * 使用change-case进行转换：https://www.npmjs.com/package/change-case
   * 需要与后端约定规范
   *
   * 当dataType === timeRange时，添加start与end前缀或后缀（取决于rangePosition，默认后缀），生成一对key
   *
   * e.g.
   * input: { dataType: "timeRange", field: "some_date", commonConfig: { rangeCase: "snake_case" } }
   * output: [{ field: "some_date_start" }, { field: "some_date_end" }]
   */
  rangeCase?: RangeCase

  /**
   * 添加start与end的位置，默认为after
   */
  rangePosition?: 'before' | 'after'

  /**
   * 适用于dataType为enum、tree等支持多选的表单组件
   */
  multipleValue?: boolean

  /**
   * 高级数据类型（如tree、enum、time等）的原始数据类型，需要与服务端进行确认
   */
  primitiveType?: 'number' | 'string'

  /**
   * 当时间类型（time、timeRange）的primitiveType为string时，需要设置传给服务端的格式化参数
   */
  serverTimeFormatter?: string
}
