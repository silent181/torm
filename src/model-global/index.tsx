import { AgGridReactProps } from 'ag-grid-react'

import { DataDef } from '../types'

export interface ModelGlobalParams {
  tableProps?: AgGridReactProps
  columnConfig?: DataDef
}

let globalConfig: ModelGlobalParams = {}

export const GlobalMethods = {
  setGlobal(options: ModelGlobalParams) {
    globalConfig = {
      ...globalConfig,
      ...options,
    }
    return globalConfig
  },
  getGlobal() {
    return globalConfig
  },
}
