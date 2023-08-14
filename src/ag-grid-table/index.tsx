import { ColDef } from 'ag-grid-community'
import { AgGridReact, AgGridReactProps } from 'ag-grid-react'
import { Spin } from 'antd'

import { getFullCls } from '../utils'
import './index.css'
import './overwritten.css'

interface AgGridTableProps extends AgGridReactProps {
  loading?: boolean
}

export interface KeyedColDef<T = any> extends ColDef<T> {
  field?: keyof T & string
}

const AgGridTable = (props: AgGridTableProps): JSX.Element => {
  const { loading, ...restProps } = props

  const withLoading = typeof loading !== 'undefined'

  let content = <AgGridReact {...restProps} />

  if (withLoading) {
    content = (
      <Spin spinning={loading} wrapperClassName={getFullCls('spin-wrapper')}>
        {content}
      </Spin>
    )
  }

  return (
    <div className={'ag-theme-alpine'} style={{ width: '100%', height: '100%' }}>
      {content}
    </div>
  )
}

export default AgGridTable
