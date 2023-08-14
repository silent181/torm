import { Input } from 'antd'

import BaseDataType from './base'

export default class LongStringType extends BaseDataType {
  getComponent() {
    return Input.TextArea
  }

  defaultProps() {
    return {
      ...super.defaultProps(),
      allowClear: true,
    }
  }

  emptyValue() {
    return ''
  }
}
