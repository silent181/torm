import { Select, SelectProps } from 'antd'

import { isNil } from '../utils'
import { Behaviors, WithPresets } from './base'

type Options = SelectProps['options']

export default class EnumType extends WithPresets<Options> implements Behaviors {
  getComponent(): typeof Select {
    return Select
  }

  defaultProps() {
    const dataDef = this.getDef()

    let ret: SelectProps = {
      ...super.defaultProps(),
      allowClear: true,
      showSearch: true,
      filterOption: (inputVal: any, option: any) => {
        const valueEq = option.value === inputVal || option.value === Number(inputVal)

        return valueEq || option.label?.toLowerCase?.()?.includes?.(inputVal?.toLowerCase?.())
      },
    }

    const options = this.getCurrentPreset()

    if (options && options.length > 0) {
      ret = {
        ...ret,
        options,
      }
    }

    if (dataDef.commonConfig?.multipleValue) {
      ret = {
        ...ret,
        mode: 'multiple',
      }
    }

    return ret
  }

  isEmpty(formValue: any) {
    if (this.getDef().commonConfig?.multipleValue) {
      return isNil(formValue) || (Array.isArray(formValue) && formValue.length === 0)
    }

    return isNil(formValue)
  }

  emptyValue() {
    const { commonConfig } = this.getDef()

    if (commonConfig?.multipleValue) {
      return []
    }

    return this.getPrimitiveEmptyValue() ?? 0
  }

  formatter(serverVal: number | string | (number | string)[]) {
    const def = this.getDef()
    const options = this.getCurrentPreset()

    if (!options || options.length === 0) {
      return serverVal
    }

    const getLabelText = (val: string | number) => options.find((item) => item.value === val)?.label || ''

    if (def.commonConfig?.multipleValue) {
      return Array.isArray(serverVal) ? serverVal.map((v) => getLabelText(v)) : ''
    }

    return getLabelText(serverVal as string | number)
  }
}
