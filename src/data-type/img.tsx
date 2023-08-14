import { PlusOutlined } from '@ant-design/icons'
import { Image, Upload } from 'antd'

import BaseDataType, { Behaviors } from './base'

interface CustomFileObj {
  uid: string
  status: 'done'
  url: string
  _realUrl: string
}

// 目前只支持单张图片
export default class ImgType extends BaseDataType implements Behaviors {
  getComponent() {
    const { action } = this.getDef().formConfig?.upload!

    const CustomUploadComponent = (props: any) => {
      return (
        <Upload
          {...props}
          action={action}
          accept=".jpg, .png"
          listType="picture-card"
          withCredentials
          onChange={(info) => {
            props.onChange(info.fileList)
          }}
          maxCount={1}
        >
          <div>
            <PlusOutlined />
            <div>Upload</div>
          </div>
        </Upload>
      )
    }

    return CustomUploadComponent
  }

  defaultItemProps() {
    return {
      valuePropName: 'fileList',
    }
  }

  emptyValue() {
    return ''
  }

  formValueGetter(serverVal: string) {
    if (typeof serverVal !== 'string' || serverVal.length === 0) {
      return []
    }

    return [
      {
        uid: serverVal,
        status: 'done',
        url: serverVal,
        _realUrl: serverVal,
      } as CustomFileObj,
    ]
  }

  paramGetter(formVal: any) {
    const fileObj = formVal?.[0]

    if (!fileObj) {
      return ''
    }

    const { getSrc } = this.getDef().formConfig?.upload!

    // 若是通过接口成功上传的对象，会有response属性
    const src: string = fileObj.response ? getSrc(fileObj.response) : (fileObj as CustomFileObj)._realUrl

    return src
  }

  cellRenderer(imgSrc: string) {
    return <Image src={imgSrc} height={'100%'} preview={false} alt="1" />
  }
}
