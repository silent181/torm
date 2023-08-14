import { PopupAdapterProps } from '../../types'
import Drawer from './drawer'
import Modal from './modal'

const popups = {
  modal: Modal,
  drawer: Drawer,
}

const PopupAdapter = (props: PopupAdapterProps) => {
  const { type, ...restProps } = props

  const Comp = popups[type]

  return <Comp {...restProps} />
}

export default PopupAdapter
