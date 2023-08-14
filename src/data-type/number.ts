import { InputNumber } from 'antd'

import BaseDataType from './base'

export default class NumberType extends BaseDataType {
  getComponent(): typeof InputNumber {
    return InputNumber
  }

  emptyValue() {
    return 0
  }
}
