import { Button, Modal, ModalProps, Space } from 'antd'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'

import CommonForm, { CommonFormProps } from '../common-form'
import { isPromiseLike } from '../utils'

const checkLoadingAndClose = (
  result: void | Promise<any> | boolean,
  closeAfterSubmit: boolean,
  submitLoading: boolean,
  onClose: () => void,
  setLoading: Dispatch<SetStateAction<boolean>>,
) => {
  const doClose = () => {
    if (closeAfterSubmit) {
      onClose()
    }
  }

  if (isPromiseLike(result)) {
    if (submitLoading) {
      setLoading(true)
    }

    result.then(doClose).finally(() => setLoading(false))
    return
  }

  if (result !== false) {
    doClose()
  }
}

export type { FormItem } from '../common-form'

interface FormModalProps<K extends string> extends CommonFormProps<K> {
  open: boolean
  onClose: () => void
  /**
   * 对若弹窗打开未修改任何内容，直接关闭
   * 设为false时，仍然会触发onFinish
   */
  skipUnchanged?: boolean
  okText?: string
  cancelText?: string
  submitLoading?: boolean
  footer?: ReactNode | null
  closeAfterSubmit?: boolean
  modalProps?: ModalProps
}

const FormModal = <K extends string>(props: FormModalProps<K>) => {
  const {
    open,
    onClose,
    title,
    footer,
    form,
    onFinish,
    submitLoading = true,
    skipUnchanged = true,
    okText = '确定',
    cancelText = '取消',
    closeAfterSubmit = true,
    modalProps = {},
    ...formProps
  } = props

  const [hasChanged, setHasChanged] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setHasChanged(false)
    } else {
      form.resetFields()
    }
  }, [form, open])

  const innerFooter = (
    <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Space>
        <Button onClick={onClose}>{cancelText}</Button>
        <Button type={'primary'} loading={loading} onClick={() => form?.submit()}>
          {okText}
        </Button>
      </Space>
    </Space>
  )

  const finalFooter = footer === undefined ? innerFooter : footer

  return (
    <Modal maskClosable={false} width={500} open={open} onCancel={onClose} footer={finalFooter} {...modalProps}>
      <CommonForm
        {...formProps}
        form={form}
        onValuesChange={(...args) => {
          setHasChanged(true)
          formProps?.onValuesChange?.(...args)
        }}
        onFinish={(formFields) => {
          if (!onFinish) {
            return
          }

          if (skipUnchanged && !hasChanged) {
            onClose()
            return
          }

          const result = onFinish(formFields)

          checkLoadingAndClose(result, closeAfterSubmit, submitLoading, onClose, setLoading)
        }}
      />
    </Modal>
  )
}

export default FormModal
