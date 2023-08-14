import { MoreOutlined } from '@ant-design/icons'
import { Dropdown, Popconfirm, Space, Typography } from 'antd'
import { Fragment } from 'react'

import { CommonAction } from '../../types'

interface ActionAdapterProps<T> {
  actions: CommonAction<T>[]
  record: T
  maxPerLine?: number
}

function renderActionItem<T>(item: CommonAction<T>, record: T) {
  const { label, action, type, confirmTitle } = item

  const labelVal = typeof label === 'function' ? label(record) : label

  if (confirmTitle) {
    return (
      <Popconfirm
        title={typeof confirmTitle === 'function' ? confirmTitle(record) : confirmTitle}
        onConfirm={() => action(record)}
      >
        <Typography.Link type={type}>{labelVal}</Typography.Link>
      </Popconfirm>
    )
  }

  return (
    <Typography.Link type={type} onClick={() => action(record)}>
      {labelVal}
    </Typography.Link>
  )
}

function ActionAdapter<T>(props: ActionAdapterProps<T>) {
  const { actions, record, maxPerLine = 3 } = props

  if (actions.length > maxPerLine) {
    return (
      <Dropdown
        menu={{
          items: actions.map((item) => {
            return {
              key: item.key,
              label: renderActionItem(item, record),
            }
          }),
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            margin: '10px 0',
            textAlign: 'center',
            lineHeight: '20px',
            borderRadius: '50%',
            border: '1px solid #181d1f',
            cursor: 'pointer',
          }}
        >
          <MoreOutlined />
        </div>
      </Dropdown>
    )
  }

  return (
    <Space size={30}>
      {actions.map((item) => {
        return <Fragment key={item.key}>{renderActionItem(item, record)}</Fragment>
      })}
    </Space>
  )
}

export default ActionAdapter
