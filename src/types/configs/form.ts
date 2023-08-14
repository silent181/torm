import { UploadProps } from 'antd'
import { ReactNode } from 'react'

import { DynamicItemProps } from '../../dynamic-item'
import { RcFormInstance } from '../base'
import { CustomProps, DataDef } from '../dataDef'
import { PopupStatus } from '../popup'
import { PresetData } from '../preset'

export type FormConfig<T> = {
  /**
   * 控制表单元素的渲染时机（create或update阶段），不传则始终渲染
   */
  renderedPhase?: PopupStatus | boolean

  /**
   * 自定义表单元素render，可与 dateType === 'custom' 搭配使用，可能会用到预请求数据
   * 需要注意此时没有经过dt层处理，api会暴露form与presetData，交给用户自己实现组件的defaultProps与defaultItemProps
   * 若自定义元素为动态渲染（依赖表单中的某些元素的值），请使用 DynamicItem，详见demo
   */
  customRender?: (dataDef: DataDef<T>, presetData: PresetData, form: RcFormInstance) => ReactNode

  /**
   * 自定义表单Item元素Form.Item props，可能会用到预请求数据
   */
  itemProps?: CustomProps<T>

  /**
   * 自定义表单元素（Input, Checkbox等) props，可能会用到预请求数据
   */
  componentProps?: CustomProps<T>

  /**
   * field to params key
   */
  transformKey?: string

  /**
   * field value to params value
   */
  transformValue?: (value: any, presetData: PresetData) => any

  /**
   * server value to form value.
   * e.g. transfrom tree ids from server into client "Cascader value" (tree paths)
   */
  getFieldValue?: (value: any, record: T, presetData: PresetData) => any

  customLabel?: ReactNode

  /**
   * 默认为true
   * allowClear为true时，会根据相应的dataType传一个兜底值给后端用来清空该字段
   */
  allowServerClear?: boolean

  dynamic?: {
    /**
     * 动态渲染表单元素，与when搭配使用
     */
    dependencies: DynamicItemProps['dependencies']

    /**
     * 动态渲染表单元素，与dependencies搭配使用
     */
    when: DynamicItemProps['when']

    /**
     * 仅当search阶段或者popup阶段才开启dynamic
     */
    only?: 'search' | 'popup'
  }

  /**
   * 当dataType为img时必传
   */
  upload?: {
    action: UploadProps['action']

    /**
     * 将response转化成src字符串
     */
    getSrc: (response: any) => string
  }
}
