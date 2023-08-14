import { Input } from 'antd'

import BaseDataType from './base'

export default class StringType extends BaseDataType {
  getComponent(): typeof Input {
    return Input
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
