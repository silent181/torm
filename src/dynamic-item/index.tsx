import { Form, FormItemProps } from 'antd'
import { FormInstance as RcFormInstance } from 'rc-field-form'
import { ReactNode } from 'react'

const { Item } = Form

export interface DynamicItemProps extends Omit<FormItemProps, 'dependencies'> {
  dependencies: string | string[]
  children?: ReactNode
  when?: (values: any[], rcForm: RcFormInstance) => boolean
  customRender?: (rcForm: RcFormInstance) => ReactNode
}

const DynamicItem = (props: DynamicItemProps) => {
  const { dependencies, children, when, customRender, ...itemProps } = props

  const finalDependencies = Array.isArray(dependencies) ? dependencies : [dependencies]

  return (
    <Item dependencies={finalDependencies} noStyle>
      {(rcForm) => {
        if (customRender) {
          return customRender(rcForm)
        }

        if (!when) {
          throw new Error("prop 'when' is missing, 'when' must be a function returns a boolean value")
        }

        const dependencyValues = finalDependencies.map((v) => rcForm.getFieldValue(v))

        return when(dependencyValues, rcForm) ? <Item {...itemProps}>{children}</Item> : null
      }}
    </Item>
  )
}

export default DynamicItem
