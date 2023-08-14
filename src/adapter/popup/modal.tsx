import { Modal as AntModal, ModalProps } from "antd";

import { CommonPopupProps } from "./type";

const Modal = (props: CommonPopupProps) => {
  const {
    title,
    open,
    onOk,
    onClose,
    children,
    componentProps,
    confirmLoading,
  } = props;

  const modalProps = (componentProps || {}) as ModalProps;

  return (
    <AntModal
      width={modalProps?.width || 520}
      title={title}
      confirmLoading={confirmLoading}
      open={open}
      onCancel={onClose}
      onOk={onOk}
      maskClosable={false}
      {...modalProps}
    >
      {children}
    </AntModal>
  );
};

export default Modal;
