import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { Button, Checkbox } from 'antd'
// import 'antd/dist/antd.css'
import { useContext, useRef } from 'react'

import Model, { DataDef, DynamicItem, ModelInstance } from '../../src'
import { DataType, getHobbies, getService } from './service.mock'

const defs: DataDef<DataType>[] = [
  {
    field: 'id',
    isId: true,
  },
  {
    field: 'name',
    dataType: 'string',
    headerName: '姓名',
    formConfig: {
      itemProps: {
        rules: [{ required: true, message: '姓名为必填项' }],
      },
    },
    searchConfig: {
      enabled: true,
      placeholder: '请输入姓名',
      itemProps: {
        rules: [],
      },
    },
  },
  {
    field: 'another',
    dataType: 'timeRange',
    commonConfig: {
      valueUnit: 'ms',
      rangeCase: 'camelCase',
    },
    hide: true,
    formConfig: {
      customLabel: '起止日期二',
    },
  },
  {
    field: 'age',
    headerName: '年龄',
    dataType: 'number',
    searchConfig: {
      enabled: true,
      placeholder: '请输入年龄',
    },
  },
  {
    field: 'hobby',
    dataType: 'enum',
    headerName: '爱好',
    commonConfig: {
      presetKey: 'hobbies',
    },
    searchConfig: {
      enabled: true,
      placeholder: '请选择爱好',
    },
    cellConfig: {
      enableExport: true,
    },
  },
  {
    field: 'hobbies',
    dataType: 'enum',
    headerName: '爱好（多选）',
    commonConfig: {
      presetKey: 'hobbies',
      multipleValue: true,
    },
    searchConfig: {
      enabled: true,
      placeholder: '请选择爱好(多选)',
    },
  },
  {
    field: 'married',
    dataType: 'boolean',
    headerName: '已婚',
    formConfig: {
      // 当年龄大于22时才显示是否已婚选项
      dynamic: {
        dependencies: 'age',
        when: (values) => values[0] > 22,
        only: 'popup',
      },
    },
    searchConfig: {
      enabled: true,
      label: '是否已婚',
    },
    cellConfig: {
      enableExport: true,
    },
  },
  {
    field: 'params1（无dataType）',
    width: 200,
  },
  {
    field: 'params2',
    dataType: 'longString',
    searchConfig: {
      enabled: true,
      placeholder: '输入params2',
    },
  },
  {
    field: 'born',
    dataType: 'time',
    headerName: '出生年月',
    commonConfig: {
      valueUnit: 'ms',
    },
    searchConfig: {
      enabled: true,
    },
  },
  {
    field: 'date',
    dataType: 'timeRange',
    commonConfig: {
      valueUnit: 'ms',
      rangeCase: 'snakeCase',
    },
    formConfig: {
      customLabel: '起止日期一',
    },
    searchConfig: {
      enabled: true,
    },
    cellConfig: {
      enableExport: true,
      headerNameStart: '开始日期',
      headerNameEnd: '结束日期',
    },
  },
  {
    field: 'department',
    dataType: 'tree',
    headerName: '部门',
    width: 400,
    commonConfig: {
      presetKey: 'departments',
    },
    searchConfig: {
      enabled: true,
      placeholder: '请选择部门',
    },
    cellConfig: {
      enableExport: true,
    },
  },
  {
    field: 'departments',
    width: 700,
    dataType: 'tree',
    headerName: '部门（多选）',
    commonConfig: {
      presetKey: 'structure',
      multipleValue: true,
    },
    searchConfig: {
      enabled: true,
      placeholder: '请选择部门(多选)',
    },
  },
  {
    field: 'multiServer',
    dataType: 'custom',
    formConfig: {
      customRender: () => {
        // 自定义数据类型示例，当params2的值为"show"时才渲染多服务器checkbox

        return (
          <DynamicItem
            dependencies={'params2'}
            label="多服务器"
            name="multiServer"
            valuePropName="checked"
            when={(values) => values[0] === 'show'}
          >
            <Checkbox />
          </DynamicItem>
        )
      },
    },
  },
  {
    field: 'avatar',
    headerName: '头像',
    dataType: 'img',
    formConfig: {
      upload: {
        action: '/decorate/api/file/upload',
        getSrc: (response) => {
          return response?.data?.url || ''
        },
      },
    },
  },
]

const paginationMode = localStorage.getItem('@pagination') === '1'
console.log(paginationMode, 'paginationMode')

const service = getService(paginationMode)

const App = () => {
  const model = useRef<ModelInstance<DataType>>(null)

  // const { structure, departments } = useContext(GlobalDataContext)

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#f0f2f5' }}>
      <Model
        ref={model}
        modelName={'item'}
        service={service}
        header={[
          {
            position: 'beforeSearch',
            render: () => (
              <>
                <Button
                  type="primary"
                  onClick={() => {
                    console.log(model.current!.getDataSource())
                    model.current!.reload()
                  }}
                >
                  reload table (beforeSearch)
                </Button>
                <Checkbox
                  style={{ marginLeft: 20 }}
                  checked={paginationMode}
                  onClick={() => {
                    if (paginationMode) {
                      localStorage.removeItem('@pagination')
                    } else {
                      localStorage.setItem('@pagination', '1')
                    }
                    location.reload()
                  }}
                >
                  分页模式
                </Checkbox>
              </>
            ),
          },
          {
            position: 'afterSearch',
            render: () => (
              <div style={{ marginBottom: 10 }}>
                <Button
                  type="primary"
                  onClick={() => {
                    console.log(model.current?.getDictionary())
                    console.log(model.current?.getDataSource())
                  }}
                >
                  自定义button
                </Button>
              </div>
            ),
          },
        ]}
        dataDefination={{
          defs,
          presets: [
            {
              key: 'hobbies',
              getter: getHobbies,
            },
            // {
            //   key: 'structure',
            //   getter: () => structure,
            // },
            // {
            //   key: 'departments',
            //   getter: () => departments,
            // },
          ],
        }}
        actionConfig={{
          // actions: ['create', 'delete'],
          cellProps: {
            pinned: 'right',
          },
        }}
        exportOptions={{
          enabled: true,
          params: {
            fileName: '模型导出结果',
          },
        }}
        // 分页
        pagination={
          paginationMode
            ? {
                enabled: true,
                pageSize: 20,
              }
            : undefined
        }

        /**
         * 仅供示例，一般情况下不会用到这个api
         */
        // clientSideFilter={(items, changed) => {
        //   if (!changed.name) {
        //     return items;
        //   }

        //   return items.filter((item) => item.name.includes(changed.name));
        // }}

        // popup={{
        //   type: "modal",
        //   title: null,
        //   props: {
        //     width: 800,
        //   },
        // }}
      />
    </div>
  )
}
export default App
