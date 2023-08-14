import { ColDef, GridApi } from 'ag-grid-community'
import { AgGridReactProps } from 'ag-grid-react'
import { ColProps, DrawerProps, ModalProps } from 'antd'

import { ActionConfig } from './action'
import { PlainObj, RcFormInstance, UniqueId } from './base'
import { DataDefination } from './dataDef'
import { ExportOptions } from './export'
import { HeaderProps } from './header'
import { PresetData } from './preset'
import { Service } from './service'

export interface CustomSubmitParams<T> {
  params: any
  action: 'create' | 'update'
  current?: T
}

export type CreateFunction = () => void
export type UpdateFunction<T> = (record: T) => void
export type DeleteFunction<T> = (record: T | null, batchIds?: any[]) => Promise<void>
export type SubmitFunction<T> = (customParams?: CustomSubmitParams<T>) => Promise<void>

export interface ModelInstance<T> {
  reload: () => Promise<void>
  refetch: (params?: PlainObj) => Promise<any>
  getDataSource: () => T[]
  getServerDataSource: () => T[]
  getPresetData: () => PresetData
  getGridApi: () => GridApi | undefined
  getDictionary: () => Dictionary
  getForms: () => { popup: RcFormInstance; search: RcFormInstance }
  getCurrent: () => T | null
  manualAction: {
    create: CreateFunction
    update: UpdateFunction<T>
    delete: DeleteFunction<T>
    submit: SubmitFunction<T>
    setDataSource: (dataSource: T[]) => void
  }
}

export type Dictionary = Record<'translation' | 'raw', Record<string, string>>

export interface ModelProps<T> {
  modelName: string

  service: Service<T>

  dataDefination: DataDefination<T>
  actionConfig?: ActionConfig<T>
  afterSubmit?: {
    closePopup?: boolean
    refresh?: boolean
  }
  header?: HeaderProps
  formLayout?: {
    labelCol?: ColProps
    wrapperCol?: ColProps
  }
  tableProps?: AgGridReactProps<T>
  popup?: {
    type: 'modal' | 'drawer'
    props?: ModalProps | DrawerProps
    title?: string | null
  }
  firstHeaderCls?: string
  secondHeaderCls?: string

  /**
   * ! 兼容特殊业务场景，可能会造成数据不同步的问题，谨慎使用
   * ! 使用时需要避免和Model同层的组件rerender
   */
  clientSideFilter?: (serverData: T[], changed: PlainObj, allFields: PlainObj) => T[]

  /**
   * 使用ag-grid的导出API，只支持csv形式，如果有定制化导出需求，需要利用api.getDataSource在外部自行实现
   */
  exportOptions?: ExportOptions

  allowClearSearch?: boolean

  /**
   * 所有配置项只支持初始化，不随组件render而rerender
   */
  pagination?: {
    enabled: boolean
    pageSize: number
    pageIndexedMode?: boolean
    lastIdGetter?: keyof T | ((item: T) => T[keyof T])
    initialLastId?: any
  }

  transformRequest?: {
    create?: (params: PlainObj, record: T) => unknown
    update?: (params: PlainObj, record: T) => unknown
    delete?: (deleteParams: UniqueId | UniqueId[], record: T | null) => unknown
    search?: (searchFields: PlainObj) => unknown
  }

  /**
   * 在manual模式下使用，会触发refetch，请谨慎使用useCallback包装
   */
  onPresetsReady?: () => void

  /**
   * 手动模式，若开启则不会在初始化时执行fetch，需要在onPresetsReady回调中使用modelInstance.refetch(params)
   */
  manual?: boolean

  rowSelection?: {
    enabled: boolean

    /**
     * refetch后是否清除所选项
     */
    autoClear?: boolean

    cellProps?: ColDef<T>
  }

  onPopupClose?: () => void
}
