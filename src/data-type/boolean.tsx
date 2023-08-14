import { Checkbox } from 'antd'

import BaseDataType, { Behaviors } from './base'

export default class BooleanType extends BaseDataType implements Behaviors {
  getComponent(): typeof Checkbox {
    return Checkbox
  }

  defaultItemProps() {
    return {
      valuePropName: 'checked',
    }
  }

  emptyValue() {
    return false
  }

  cellRenderer(value: boolean) {
    return <Checkbox checked={value} disabled />
  }
}
