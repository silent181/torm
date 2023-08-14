import { ColDef } from 'ag-grid-community'
import { BlockProps } from 'antd/lib/typography/Base'

export type BuiltInAction = 'create' | 'update' | 'delete'

export type CommonAction<T = any> = {
  key: string | number
  label: string | ((record: T) => string)
  action: (record: T) => void
  confirmTitle?: string | ((record: T) => string)
  type?: BlockProps['type']
}

export type Actions<T = any> = (BuiltInAction | CommonAction<T>)[]

export interface ActionConfig<T> {
  actions?: Actions<T>
  cellProps?: ColDef<T>
  deleteConfirmSuffix?: (record: T) => string
}
