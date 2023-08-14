import { Form, FormInstance, FormItemProps, FormProps } from 'antd'
import { FormInstance as RcFormInstance } from 'rc-field-form'
import { ReactNode } from 'react'

import DynamicItem from '../dynamic-item'

export interface FormItem<K extends string = string> extends Omit<FormItemProps, 'dependencies'> {
  name: K
  component: ReactNode
  dependencies?: string | string[]
  when?: (values: any[], rcForm: RcFormInstance) => boolean
}

export type FormFields<K extends string> = Record<K, any>

export interface CommonFormProps<K extends string> extends FormProps {
  formItems: FormItem<K>[]
  form: FormInstance
  onFinish?: (params: FormFields<K>) => Promise<any> | void | boolean
  customRender?: (items: ReactNode[]) => ReactNode
}

const { Item } = Form

const CommonForm = <K extends string>(props: CommonFormProps<K>) => {
  const { formItems, onFinish, customRender, ...rest } = props

  const items = formItems.map((item) => {
    const { name, component, dependencies, when, ...restFormItemProps } = item

    if (dependencies && when) {
      const realDependencies = Array.isArray(dependencies) ? dependencies : [dependencies]

      return (
        <DynamicItem key={name} name={name} dependencies={realDependencies} when={when} {...restFormItemProps}>
          {component}
        </DynamicItem>
      )
    }

    return (
      <Item key={name} name={name} {...restFormItemProps}>
        {component}
      </Item>
    )
  })

  return (
    <Form onFinish={onFinish} {...rest}>
      {customRender ? customRender(items) : items}
    </Form>
  )
}

export default CommonForm
