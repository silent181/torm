import { message } from 'antd'
import { RefObject } from 'react'

import { ModelInstance } from '../types'

interface Options {
  message?: {
    enabled?: boolean
    msg?: string
  }
}

export default function useSelectableTable<T>(ref: RefObject<ModelInstance<T>>, option?: Options) {
  const { enabled = true, msg = '至少选择一条数据' } = option?.message || {}

  const getSelectedRows = () => {
    const instance = ref.current

    if (!instance) {
      return []
    }

    const selectedRows: T[] = instance.getGridApi()!.getSelectedRows()

    return selectedRows
  }

  const ensureSelected = (): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      const selected = getSelectedRows()

      if (!selected || selected.length === 0) {
        enabled && message.warning(msg)
        reject()
        return
      }

      resolve(selected)
    })
  }

  return {
    getSelectedRows,
    ensureSelected,
  }
}
