import { DownOutlined } from '@ant-design/icons'
import { ColDef, CsvExportParams, ExcelExportParams, GridApi, IGetRowsParams, IRowNode } from 'ag-grid-community'
import { AgGridReactProps } from 'ag-grid-react'
import { Button, Col, Form, Input, Row, SelectProps, Typography, message } from 'antd'
import classNames from 'classnames'
import {
  ForwardedRef,
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import ActionAdapter from './adapter/action'
import PopupAdapter from './adapter/popup'
import AgGridTable from './ag-grid-table'
import { builtinActions } from './constant'
import { Behaviors, getDt } from './data-type'
import { WithPresets } from './data-type/base'
import DynamicItem from './dynamic-item'
import { usePopup } from './hooks'
import './index.css'
import { GlobalMethods } from './model-global'
import {
  BuiltInAction,
  CommonAction,
  CreateFunction,
  CustomProps,
  DataDef,
  DeleteFunction,
  Dictionary,
  ModelInstance,
  ModelProps,
  PlainObj,
  PresetConfig,
  PresetData,
  RcFormInstance,
  SubmitFunction,
  UpdateFunction,
} from './types'
import { filterObj, getFullCls, isPromiseLike, last } from './utils'

const getDefsForForm = (defs: DataDef[]) => {
  const filtered = defs.filter((item) => item.isId || item.dataType !== undefined)

  return filtered
}

const getDefsForSearch = (defs: DataDef[]) => {
  const filtered = defs.filter((item) => item?.searchConfig?.enabled === true)

  return filtered
}

const getDisplayedFields = (defs: DataDef[]) => {
  return defs.filter((d) => d?.dataType !== 'custom')
}

const getExtendedDefs = (defs: DataDef[], presetData?: PresetData) => {
  const extDefs: DataDef[] = []

  defs.forEach((def) => {
    const dt = getDt(def, presetData) as Behaviors | null

    if (dt?.extTableColumns) {
      const extendedDefs = dt.extTableColumns()
      extendedDefs.forEach((d) => extDefs.push(d))
    } else {
      extDefs.push(def)
    }
  })

  return extDefs
}

const getExtendedFormFields = (formFields: PlainObj, defs: DataDef[], presetData?: PresetData) => {
  let extFields: PlainObj = {}

  Object.entries(formFields).forEach(([key, val]) => {
    const defOfCurKey = defs.find((def) => def.field === key)!

    const dt = getDt(defOfCurKey, presetData) as Behaviors | null

    if (dt?.extFormFields) {
      const ext = dt.extFormFields(val)
      extFields = {
        ...extFields,
        ...ext,
      }
    } else {
      extFields[key] = val
    }
  })

  return extFields
}

const getDefsForTable = (defs: DataDef[], presetData: PresetData) => {
  const handleDef = (def: DataDef): DataDef => {
    const ret = { ...def }

    const dt = getDt(def, presetData) as Behaviors | null

    const presetFormatter = (value: any) => {
      if (dt?.formatter) {
        return dt.formatter(value)
      }

      return value
    }

    ret.valueFormatter = (params) => {
      return presetFormatter(params.value)
    }

    if (def?.cellConfig?.formatter) {
      const customFormatter = def.cellConfig.formatter

      ret.valueFormatter = (params) => {
        const { value, data } = params
        return customFormatter(presetFormatter(value), data!, presetData, value)
      }
    }

    if (dt?.cellRenderer) {
      const persetRenderer = dt.cellRenderer

      ret.cellRenderer = (params: any) => {
        const { value, data } = params

        return persetRenderer(value, data)
      }
    }

    if (def?.cellConfig?.renderCell) {
      const customRenderer = def.cellConfig.renderCell

      ret.cellRenderer = (params: any) => {
        const { value, data } = params

        return customRenderer(value, data, presetData)
      }
    }

    return ret
  }

  const finalDefsForTable = getExtendedDefs(getDisplayedFields(defs), presetData)

  return finalDefsForTable.map(handleDef)
}

const getDictionary = (defs: DataDef[]) => {
  const dic: Dictionary = {
    raw: {},
    translation: {},
  }

  defs
    .filter((d) => d.headerName)
    .forEach(({ field, headerName }) => {
      dic.translation[headerName!] = field!
      dic.raw[field!] = headerName!
    })

  return dic
}

const _Model = <T extends PlainObj>(props: ModelProps<T>, ref: ForwardedRef<ModelInstance<T>>) => {
  const {
    modelName,
    service,
    dataDefination,
    actionConfig,
    afterSubmit,
    header,
    formLayout,
    tableProps,
    popup,
    firstHeaderCls,
    secondHeaderCls,
    clientSideFilter,
    exportOptions,
    allowClearSearch,
    pagination,
    transformRequest,
    onPresetsReady,
    manual,
    rowSelection,
    onPopupClose,
  } = props

  const { onGridReady, ...restTableProps } = tableProps || {}
  const popupType = popup?.type || 'modal'
  const actions = actionConfig?.actions || builtinActions
  const { defs, presets } = dataDefination
  const { pageIndexedMode, lastIdGetter, pageSize, initialLastId } = pagination || {}
  const enablePagination = pagination?.enabled === true

  const serverSideDs = useRef<T[]>([])
  const gridApi = useRef<GridApi<T>>()
  const pageParamsRef = useRef<{ lastId: number | string | null }>({
    lastId: initialLastId,
  })

  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([] as T[])
  const [presetData, setPresetData] = useState({} as PresetData)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchCollapsed, setSearchCollapsed] = useState(false)
  const [fresh, setFresh] = useState(false)

  const idPropName = useMemo(() => defs.find((item) => item.isId)?.field, [defs])
  const defsForForm = useMemo(() => getDefsForForm(defs), [defs])
  const defsForSearch = useMemo(() => getDefsForSearch(defs), [defs])
  const defsForTable = useMemo(() => getDefsForTable(defs, presetData), [defs, presetData])
  const dictionary = useMemo(() => getDictionary(defsForTable), [defsForTable])

  const [{ popupStatus, current, popupProps }, popupAction] = usePopup<T>()
  const [popupForm] = Form.useForm()
  const [searchForm] = Form.useForm()

  const isFreshPresets = (presets as PresetConfig)?.fresh

  const getPopupTitle = () => {
    if (popup?.title === null) {
      return null
    }

    return (
      popup?.title ??
      (popupStatus === 'create' ? `新增${modelName}` : popupStatus === 'update' ? `编辑${modelName}` : '')
    )
  }

  const closePopup = () => {
    popupProps.onClose()
    onPopupClose?.()
  }

  const getId = (item: T | null | undefined) => {
    if (!item || !idPropName) {
      return null
    }

    return item?.[idPropName] ?? null
  }

  const getFieldName = (field: DataDef<T>['field']) => {
    if (!field) {
      return ''
    }

    return dictionary.raw?.[field] || field
  }

  const getAllNodes = useCallback(() => {
    if (!gridApi.current?.forEachNode) {
      return []
    }

    const result: IRowNode<T>[] = []

    gridApi.current!.forEachNode((node) => {
      result.push(node)
    })

    return result
  }, [])

  const fetchPresets = useCallback(async () => {
    const fetchers = Array.isArray(presets) ? presets : presets?.data

    if (!fetchers || fetchers.length === 0) {
      onPresetsReady?.()
      return
    }

    const allReq = fetchers.map((fetcher) => {
      const { key, getter } = fetcher
      const ret = getter()

      if (isPromiseLike(ret)) {
        return ret.then((res) => ({ data: res, key }))
      }

      return {
        data: ret,
        key,
      }
    })

    const allRes = await Promise.all(allReq)

    const presetsData = {} as PresetData
    allRes.forEach((res) => {
      presetsData[res.key] = res.data
    })

    setPresetData(presetsData)
    onPresetsReady?.()
  }, [onPresetsReady, presets])

  const handleCreate: CreateFunction = () => {
    if (isFreshPresets) {
      fetchPresets()
    }

    popupForm.resetFields()
    popupAction('create')
  }

  const fetchData = useCallback(
    (params?: PlainObj, pageParam?: number | string | null) => {
      setLoading(true)

      const size = enablePagination ? pageSize : undefined

      return service
        .list(params, pageParam, size)
        .then((res) => {
          serverSideDs.current = res
          setFresh(true)
          if (!enablePagination) {
            setDataSource(res)
          }

          if (rowSelection && rowSelection?.autoClear !== false) {
            getAllNodes().forEach((node) => node.setSelected(false))
          }

          return res
        })
        .finally(() => {
          setLoading(false)
        })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [service],
  )

  const fetchPaginationData = useCallback(
    (params?: PlainObj, api?: GridApi) => {
      return new Promise<T[]>((resolve) => {
        const API = api || gridApi.current

        // polling until API is available
        if (!API) {
          setTimeout(() => {
            fetchPaginationData(params)
          }, 200)

          resolve([])
          return
        }

        const dataSource = {
          getRows: (getRowParams: IGetRowsParams) => {
            const pageParam =
              pageIndexedMode === false ? pageParamsRef.current.lastId : getRowParams.startRow / pageSize! + 1

            fetchData(params, pageParam).then((res) => {
              const hasMore = res.length === pageSize

              pageParamsRef.current.lastId = null

              if (hasMore) {
                const lastItem = last(res)

                if (lastItem) {
                  const lastId = typeof lastIdGetter === 'function' ? lastIdGetter(lastItem) : lastItem?.[lastIdGetter!]

                  pageParamsRef.current.lastId = lastId
                }
              }

              getRowParams.successCallback(res, hasMore ? getRowParams.endRow + 1 : getRowParams.startRow + res.length)
              resolve(res)
            })
          },
        }

        API.setDatasource(dataSource)
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchData],
  )

  /**
   * ag-grid的cellRenderer不会随着dataSource变化而更新，所以需要强制刷新
   * refreshCells必须在一个新的宏任务下执行，否则也会失效
   * force参数为true也必不可少
   */
  const forceRefreshCells = () => {
    const hasCustomRender = defsForTable.some((def) => def.cellConfig?.renderCell !== undefined)

    if (hasCustomRender) {
      console.log('force refresh cells')
      setTimeout(() => {
        gridApi.current?.refreshCells({
          rowNodes: gridApi.current.getRenderedNodes(),
          force: true,
        })
      }, 100)
    }
  }

  const refetch = async (params?: PlainObj) => {
    let result: T[]

    if (enablePagination) {
      result = await fetchPaginationData(params)
    } else {
      result = await fetchData(params)
    }

    forceRefreshCells()

    return result
  }

  const reload = async () => {
    searchForm.resetFields()
    pageParamsRef.current.lastId = initialLastId
    await refetch()
  }

  const handleUpdate: UpdateFunction<T> = (record) => {
    if (isFreshPresets) {
      fetchPresets()
    }

    popupAction('update', record)

    const formFields = {} as PlainObj

    defsForForm.forEach((def) => {
      const key = def.field!

      let formVal = record[key]

      const dt = getDt(def, presetData) as Behaviors | null

      if (dt?.formValueGetter) {
        formVal = dt.formValueGetter(record[key], record)
      }

      if (def?.formConfig?.getFieldValue) {
        formVal = def.formConfig.getFieldValue(formVal, record, presetData)
      }

      formFields[key] = formVal
    })

    popupForm.setFieldsValue(formFields)
  }

  const handleDelete: DeleteFunction<T> = async (record, batchIds) => {
    let params: any

    if (Array.isArray(batchIds)) {
      params = batchIds
    } else {
      params = getId(record)
    }

    if (transformRequest?.delete) {
      params = transformRequest.delete(params, record!)
    }

    await service!.delete!(params, record!)
    message.success('删除成功')
    reload()
  }

  const getColumns = () => {
    const commonColumns = {
      width: 150,
    }

    // combine commonProps and remove other props don't belong to grid ColDef
    let columns: ColDef<T>[] = defsForTable.map(
      ({ isId, dataType, commonConfig, cellConfig, formConfig, searchConfig, CustomDt, ...rest }) => ({
        ...commonColumns,
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        ...Model.getGlobal()?.columnConfig,
        ...rest,
      }),
    )

    let defaultActions: CommonAction<T>[] = [
      {
        key: 'update',
        label: '编辑',
        action: handleUpdate,
      },
      {
        key: 'delete',
        label: '删除',
        confirmTitle: (record) =>
          `确认删除${modelName}${actionConfig?.deleteConfirmSuffix?.(record) ?? getId(record)}?`,
        type: 'danger',
        action: handleDelete,
      },
    ]

    defaultActions = defaultActions.filter((item) => actions.includes(item.key as BuiltInAction))

    const customActions = actions.filter(
      (a) =>
        !builtinActions.includes(a as BuiltInAction) &&
        !builtinActions.includes((a as CommonAction<T>).key as BuiltInAction),
    ) as CommonAction[]

    const finalActions = [...defaultActions, ...customActions]

    if (finalActions.length > 0) {
      columns = [
        ...columns,
        {
          headerName: '操作',
          width: finalActions.length > 3 ? 100 : undefined,
          cellRenderer: (params: any) => {
            const record = params.data as T

            return <ActionAdapter actions={finalActions} record={record} />
          },
          ...actionConfig?.cellProps,
        },
      ]
    }

    if (rowSelection?.enabled) {
      columns = [
        {
          width: 50,
          headerCheckboxSelection: true,
          checkboxSelection: true,
          ...rowSelection?.cellProps,
        },
        ...columns,
      ]
    }

    return columns
  }

  const getDataSource = useCallback(() => {
    if (enablePagination) {
      return getAllNodes()
        .map((node) => node.data as T)
        .filter((v) => v)
    }

    return dataSource
  }, [dataSource, enablePagination, getAllNodes])

  const getParams = async (defs: DataDef[], form: RcFormInstance, isSearch = false) => {
    const fields: PlainObj = await form.validateFields()

    const extfields = getExtendedFormFields(fields, defs, presetData)
    const extDefs = getExtendedDefs(defs, presetData)

    let params: PlainObj = {}

    extDefs.forEach((def) => {
      const { field, formConfig, isId } = def

      const { transformKey, transformValue } = formConfig || {}

      const paramsKey = transformKey || field!

      let paramVal = extfields[field!]

      if (!isId) {
        const dt = getDt(def, presetData) as Behaviors | null

        // 仅当编辑状态才会取可能为空的值传给后端
        if (popupStatus === 'update' && dt) {
          paramVal = dt.getFormValueWhenEdit(paramVal)
        }

        if (dt?.paramGetter) {
          paramVal = dt.paramGetter(paramVal)
        }
      }

      if (transformValue) {
        paramVal = transformValue(paramVal, presetData)
      }

      params[paramsKey] = paramVal
    })

    const emptyTypes = isSearch ? ['', false, {}, []] : popupStatus === 'create' ? [''] : undefined
    params = filterObj(params, emptyTypes)

    return params
  }

  const submit: SubmitFunction<T> = async (customParams) => {
    let params = await getParams(defsForForm, popupForm)

    console.log(params, 'params')
    // return;

    setConfirmLoading(true)

    try {
      if (service.customSubmit) {
        await service.customSubmit(
          customParams?.params || params,
          customParams?.action || (popupStatus as 'create' | 'update'),
          customParams?.current || current,
        )
      } else if (popupStatus === 'create') {
        if (transformRequest?.create) {
          params = transformRequest.create(params, current!) as PlainObj
        }

        await service!.create!(params)
      } else {
        if (transformRequest?.update) {
          params = transformRequest.update(params, current!) as PlainObj
        }

        await service!.update!(getId(current)!, params, current!)
      }
    } catch {
      setConfirmLoading(false)
      return
    }

    setConfirmLoading(false)

    if (afterSubmit?.closePopup !== false) {
      closePopup()
    }

    if (afterSubmit?.refresh !== false) {
      reload()
    }
  }

  const search = async () => {
    let params = await getParams(defsForSearch, searchForm, true)

    if (transformRequest?.search) {
      params = transformRequest?.search(params) as PlainObj
    }
    console.log(params, 'search params')

    setSearchLoading(true)
    const res = await refetch(params)
    setSearchLoading(false)

    return res
  }

  const genFormItem = (def: DataDef, isSearch = false) => {
    const { field, formConfig, searchConfig } = def
    const { itemProps, componentProps, customLabel, dynamic } = formConfig || {}

    const getCustomProps = (customProps: CustomProps<T> | undefined) => {
      if (!customProps) {
        return {}
      }

      if (typeof customProps === 'function') {
        return customProps(def, presetData)
      }

      return customProps
    }

    const dt = getDt(def, presetData)!

    const defaultItemProps = dt.defaultItemProps()
    const customItemProps = getCustomProps(itemProps)
    let finalItemProps = {
      name: field,
      ...defaultItemProps,
      ...customItemProps,
    }

    finalItemProps.label = isSearch ? searchConfig?.label : customLabel || getFieldName(field)

    const defaultProps = dt.defaultProps()
    const customComponentProps = getCustomProps(componentProps)
    let finalComponentProps = {
      ...defaultProps,
      ...customComponentProps,
    }

    if (isSearch) {
      finalComponentProps.placeholder = searchConfig?.placeholder

      finalItemProps = {
        ...finalItemProps,
        ...getCustomProps(searchConfig?.itemProps),
      }

      finalComponentProps = {
        ...finalComponentProps,
        ...getCustomProps(searchConfig?.componentProps),
      }
    }

    const Comp = dt.getComponent()

    const normalEl = (
      <Form.Item {...finalItemProps}>
        <Comp {...finalComponentProps} />
      </Form.Item>
    )

    if (dynamic) {
      const { only, when, dependencies } = dynamic

      const dynamicEl = (
        <DynamicItem {...finalItemProps} when={when} dependencies={dependencies}>
          <Comp {...finalComponentProps} />
        </DynamicItem>
      )

      if ((only === 'popup' && isSearch) || (only === 'search' && !isSearch)) {
        return normalEl
      }

      return dynamicEl
    }

    return normalEl
  }

  const renderFormItem = (dataDef: DataDef<T>) => {
    const { isId, formConfig } = dataDef
    const { renderedPhase, customRender } = formConfig || {}

    if (typeof renderedPhase === 'boolean') {
      if (renderedPhase === false) {
        return null
      }
    } else if (renderedPhase === null || (renderedPhase && renderedPhase !== popupStatus)) {
      return null
    }

    if (customRender) {
      return customRender(dataDef, presetData, popupForm)
    }

    if (isId) {
      return popupStatus === 'create' ? null : (
        <Form.Item name={idPropName} label={'id'} rules={[{ required: true }]}>
          <Input disabled={popupStatus === 'update'} />
        </Form.Item>
      )
    }

    return genFormItem(dataDef)
  }

  const renderSearchItem = (dataDef: DataDef<T>) => {
    const { formConfig } = dataDef
    const { customRender } = formConfig || {}

    if (customRender) {
      return customRender(dataDef, presetData, searchForm)
    }

    return genFormItem(dataDef, true)
  }

  const renderForm = () => {
    return (
      <Form
        form={popupForm}
        wrapperCol={formLayout?.wrapperCol || { span: 18 }}
        labelCol={formLayout?.labelCol || { span: 6 }}
      >
        {defsForForm.map((d) => {
          return <Fragment key={d.field}>{renderFormItem(d)}</Fragment>
        })}
      </Form>
    )
  }

  const renderCustomHeader = (position: 'beforeSearch' | 'afterSearch') => {
    if (!header || !header.length) {
      return null
    }

    const h = header.find((h) => h.position === position)

    return h?.render?.() || null
  }

  const renderExportBtn = (firstLine = false) => {
    if (exportOptions?.enabled !== true) {
      return null
    }

    const filteredDefs = defsForTable.filter((d) => d?.cellConfig?.enableExport === true)

    if (filteredDefs.length === 0) {
      return null
    }

    return (
      <Button
        type="primary"
        className={classNames(getFullCls('export-btn'), {
          'auto-left': firstLine,
        })}
        onClick={async () => {
          const doExport = (ds?: T[]) => {
            const source = ds || dataSource
            if (source.length === 0) {
              message.warning('暂无可导出内容')
              return
            }

            const exportedKeys = filteredDefs.map((d) => d.field!)

            const params: CsvExportParams | ExcelExportParams = {
              columnKeys: exportedKeys,
              processCellCallback: (params) => {
                const { value, column } = params
                const curDef = filteredDefs.find((item) => item.field === column.getColDef().field)

                if (!curDef) {
                  return value
                }

                const { cellConfig, dataType } = curDef

                if (cellConfig?.exportRaw) {
                  return value
                }

                let resultValue = value

                const curData: T = params.node?.data || {}

                if (dataType === 'enum') {
                  const dt = getDt(curDef, presetData) as WithPresets<SelectProps['options']>

                  const options = dt.getCurrentPreset()!

                  resultValue = options.find((item) => item.value === value)?.label || ''
                }

                // exportFormatter has highest priority
                if (cellConfig?.exportFormatter) {
                  resultValue = cellConfig.exportFormatter(value, curData)
                }

                return resultValue
              },
              ...exportOptions?.params,
            }

            if (exportOptions.excel) {
              gridApi.current!.exportDataAsExcel(params as ExcelExportParams)
            } else {
              gridApi.current!.exportDataAsCsv(params as CsvExportParams)
            }
          }

          if (exportOptions.fetchBeforeExport) {
            if (fresh) {
              doExport()
            } else {
              const searchResult = await search()

              setFresh(true)

              setTimeout(() => {
                doExport(searchResult)
              }, 300)
            }
          } else {
            doExport()
          }
        }}
      >
        导出
      </Button>
    )
  }

  const renderFirstInnerHeader = (hasSearchItem: boolean) => {
    const hasCreateAction = actions.includes('create')

    if (!hasCreateAction && header?.find((h) => h.position === 'beforeSearch') === undefined) {
      return null
    }

    return (
      <div className={classNames(getFullCls('header-inner-first'), firstHeaderCls)}>
        {hasCreateAction && (
          <Button type="primary" onClick={handleCreate} style={{ marginRight: 30 }}>
            {`新增${modelName}`}
          </Button>
        )}
        {renderCustomHeader('beforeSearch')}
        {!hasSearchItem && renderExportBtn(true)}
      </div>
    )
  }

  const renderSecondInnerHeader = (hasSearchItem: boolean) => {
    if (!hasSearchItem) {
      return null
    }

    const renderSearchForm = () => {
      if (!hasSearchItem) {
        return null
      }

      return (
        <Form
          className={getFullCls('search-form')}
          form={searchForm}
          onValuesChange={(changed, values) => {
            if (typeof clientSideFilter === 'function') {
              const filtered = clientSideFilter(serverSideDs.current, changed, values)

              setDataSource(filtered)
            }

            setFresh(false)
          }}
        >
          {/* TODO: 留一个接口后续可自定义布局 */}
          <Row gutter={16}>
            {defsForSearch.map((d, i) => {
              return (
                <Col
                  span={8}
                  key={d.field}
                  className={classNames(getFullCls('ant-col'), {
                    hidden: !searchCollapsed && i > 2,
                  })}
                >
                  {renderSearchItem(d)}
                </Col>
              )
            })}
          </Row>
        </Form>
      )
    }

    const renderQueryBtn = () => {
      if (clientSideFilter || !hasSearchItem) {
        return null
      }

      return (
        <Button type="primary" className={getFullCls('search-btn')} onClick={search} loading={searchLoading}>
          查询
        </Button>
      )
    }

    const renderClearSearchBtn = () => {
      if (clientSideFilter || !hasSearchItem || allowClearSearch === false) {
        return null
      }

      return (
        <Button
          className={getFullCls('clear-search-btn')}
          onClick={() => {
            searchForm.resetFields()
          }}
        >
          清空
        </Button>
      )
    }

    const renderCollapseBtn = () => {
      const showCollapse = defsForSearch.length > 3

      if (!showCollapse) {
        return null
      }

      return (
        <Typography.Link style={{ marginLeft: 10 }} onClick={() => setSearchCollapsed((c) => !c)}>
          <span>{searchCollapsed ? '收起' : '展开'}</span>
          <DownOutlined
            className={classNames(getFullCls('arrow'), {
              collapsed: searchCollapsed,
            })}
          />
        </Typography.Link>
      )
    }

    return (
      <div className={classNames(getFullCls('header-inner-second'), secondHeaderCls)}>
        {renderSearchForm()}
        <div>
          {renderQueryBtn()}
          {renderClearSearchBtn()}
          {renderExportBtn()}
          {renderCollapseBtn()}
        </div>
      </div>
    )
  }

  useEffect(() => {
    const init = async () => {
      if (manual) {
        fetchPresets()
      } else {
        setLoading(true)
        await fetchPresets()

        if (enablePagination) {
          fetchPaginationData()
        } else {
          fetchData()
        }
      }
    }

    init()
  }, [enablePagination, fetchData, fetchPaginationData, fetchPresets, manual])

  useImperativeHandle(ref, () => ({
    reload,
    refetch,
    getDataSource: getDataSource,
    getPresetData: () => presetData,
    getGridApi: () => gridApi.current,
    getDictionary: () => dictionary,
    getForms: () => {
      return {
        popup: popupForm,
        search: searchForm,
      }
    },
    getCurrent: () => current,
    getServerDataSource: () => serverSideDs.current,
    manualAction: {
      create: handleCreate,
      update: handleUpdate,
      delete: handleDelete,
      submit,
      setDataSource,
    },
  }))

  const getInternalTableProps = (): AgGridReactProps => {
    let ret = {} as AgGridReactProps

    if (enablePagination) {
      ret = {
        rowModelType: 'infinite',
        cacheBlockSize: pageSize,
      }
    } else {
      ret = {
        rowData: dataSource,
      }
    }

    if (rowSelection?.enabled) {
      ret = {
        ...ret,
        rowSelection: 'multiple',
        suppressRowClickSelection: true,
      }
    }

    return {
      ...ret,
      onGridReady: (e) => {
        gridApi.current = e.api
        onGridReady?.(e)
      },
    }
  }

  const hasSearchItem = defsForSearch.length > 0

  return (
    <>
      <div className={getFullCls('container')}>
        <div className={getFullCls('header')}>
          {renderFirstInnerHeader(hasSearchItem)}
          {renderSecondInnerHeader(hasSearchItem)}
          {renderCustomHeader('afterSearch')}
        </div>
        <AgGridTable
          getRowId={idPropName ? (params) => `${getId(params.data)}` : undefined}
          loading={loading}
          defaultColDef={{
            resizable: true,
          }}
          columnDefs={getColumns()}
          {...getInternalTableProps()}
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          {...Model.getGlobal()?.tableProps}
          {...restTableProps}
        />
      </div>
      <PopupAdapter
        type={popupType}
        title={getPopupTitle()}
        confirmLoading={confirmLoading}
        open={popupProps.open}
        onClose={closePopup}
        onOk={() => submit()}
        componentProps={popup?.props}
      >
        {renderForm()}
      </PopupAdapter>
    </>
  )
}

const Model = Object.assign(
  forwardRef(_Model) as <T>(
    props: ModelProps<T> & { ref?: ForwardedRef<ModelInstance<T>> },
  ) => ReturnType<typeof _Model>,
  GlobalMethods,
)

export default Model
