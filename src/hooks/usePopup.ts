import { useState } from 'react'

import { PopupStatus } from '../types'

export interface HookPopupProps {
  open: boolean
  onClose: () => void
}

type PopupAction<T> = (popup: PopupStatus, record?: T) => void

type PopupValues<T> = {
  popupStatus: PopupStatus
  current: T | null
  popupProps: HookPopupProps
}

type usePopupResult<T> = [PopupValues<T>, PopupAction<T>, (current: T) => void]

export default function usePopup<T>(): usePopupResult<T> {
  const [current, setCurrent] = useState<T | null>(null)
  const [status, setStatus] = useState<PopupStatus>(null)

  const popup = (action: PopupStatus, record?: T | null) => {
    setStatus(action)

    if (action === 'update') {
      setCurrent(record!)
    }
  }

  const onClose = () => {
    setStatus(null)
    setCurrent(null)
  }

  const popupProps = {
    open: status !== null,
    onClose,
  }

  return [{ popupStatus: status, current, popupProps }, popup, setCurrent]
}
