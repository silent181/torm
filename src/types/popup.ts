import { DrawerProps, ModalProps } from 'antd'
import { ReactNode } from 'react'

import { BuiltInAction } from './action'

export interface PopupAdapterProps {
  type: 'modal' | 'drawer'
  title: ReactNode
  open: boolean
  onOk: () => void
  onClose: () => void
  confirmLoading: boolean
  children?: ReactNode
  componentProps?: ModalProps | DrawerProps
}

export type PopupStatus = Exclude<BuiltInAction, 'delete'> | null
