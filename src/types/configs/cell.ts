import { ReactNode } from 'react'

import { PresetData } from '../preset'

export type CellConfig<T> = {
  /**
   * 需要格式化的字段，defaultFormattedValue已经在dataType层被转化过一次。可能会用到预请求数据
   */
  formatter?: (defaultFormattedValue: any, item: T, presetData: PresetData, rawValue: any) => string

  /**
   * 自定义表格render，可能会用到预请求数据
   */
  renderCell?: (value: any, item: T, presetData: PresetData) => ReactNode

  enableExport?: boolean

  /**
   * dataType为timeRange时，开始时间的headerName
   */
  headerNameStart?: string
  /**
   * dataType为timeRange时，结束时间的headerName
   */
  headerNameEnd?: string

  /**
   * 导出时的格式化函数
   */
  exportFormatter?: (originalFieldValue: any, item: T) => string | number

  /**
   * 为true时，直接导出原始值
   */
  exportRaw?: boolean
}
