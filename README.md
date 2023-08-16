# Torm

A comprehensive admin CRUD page SDK which Integrates frequently used "table" and "form" APIs

# Usage
```bash
git clone https://github.com/silent181/torm

cd dev

npm i

npm run dev
```

# 与Model直接相关的API

## ModelProps\<T>

| 参数             | 说明                                                         | 类型                                                         | 默认值                                                       | 必填 |
| :--------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :--- |
| modelName        | 模型名称，用于定义数据                                       | string                                                       |                                                              | true |
| service          | 控制数据增删改查，详见 Service                               | Service\<T\>                                                 |                                                              | true |
| dataDefination   | 对数据类型的定义，类似表格中的 columns，为 columns 类型的扩展 | DataDefination\<T\>                                          |                                                              | true |
| actionConfig     | action 表示对数据的操作，包括内置行为（增、删、改）与自定义行为 | ActionConfig\<T>                                             |                                                              |      |
| afterSubmit      | 表单提交后的行为，目前支持是否关闭 popup、是否自动刷新       | { <br>closePopup?: boolean<br>refresh?: boolean <br>}        | { <br> closePopup: true<br> refresh: true <br>}              |      |
| header           | 自定义头部，可自定义的区域为 beforeSearch 与 afterSearch     | tuple                                                        |                                                              |      |
| formLayout       | popup 的 formLayout                                          | { <br>labelCol?: ColProps<br>wrapperCol?: ColProps <br>}     | { <br> labelCol: { span: 6 }<br>wrapperCol: { span: 18 } <br>} |      |
| tableProps       | 表格 props                                                   | AgGridReactProps\<T>                                         |                                                              |      |
| popup            | popup 类型，目前支持 modal 和 drawer，默认为 modal           | { <br> type: 'modal' \| 'drawer'<br>props?: ModalProps \| DrawerProps <br> title?: string \| null<br>} |                                                              |      |
| firstHeaderCls   | 第一行header的className                                      | string                                                       |                                                              |      |
| secondHeaderCls  | 第二行header的className                                      | string                                                       |                                                              |      |
| clientSideFilter | 开启客户端查询模式，不支持分页（可能会造成数据不同步的问题，谨慎使用） | (serverData: T[], changed: PlainObj, allFields: PlainObj) => T[] |                                                              |      |
| exportOptions    | 导出相关配置<br>使用ag-grid的导出API，只支持csv形式，如果有定制化导出需求，需要利用api.getDataSource在外部自行实现 | ExportOptions                                                |                                                              |      |
| allowClearSearch | 允许清空筛选项                                               | boolean                                                      |                                                              |      |
| pagination       | 分页（仅支持无限下拉形式，pageIndex模式在ag-grid中需要收费版企业模式） | { <br>enabled: boolean<br>pageSize: number<br>}              |                                                              |      |
| transformRequest | 参数到达service之前的最后一步转化                            | { <br>create?: Function<br>update?: Function<br>delete?: Function<br>search?: Function<br>} |                                                              |      |
| onPresetsReady   | 预制数据获取完成的回调，通常在manual模式下使用<br>会触发refetch，最好用useCallback包装 | () => void                                                   |                                                              |      |
| manual           | 手动模式，若开启手动模式，则不会在初始化时执行fetch，需要在onPresetsReady回调中使用`modelInstance.current.refetch(params)` | boolean                                                      |                                                              |      |
| rowSelection     | 是否开启表格行可选中                                         | { <br/>enabled: boolean<br/>autoClear?: boolean<br/>}        |                                                              |      |



## ExportOptions

| 参数              | 说明                                                         | 类型            | 默认值 | 必填 |
| ----------------- | ------------------------------------------------------------ | --------------- | ------ | ---- |
| enabled           | 开关                                                         | boolean         |        | true |
| params            | ag-grid的参数                                                | CsvExportParams |        |      |
| fetchBeforeExport | 兼容一些业务方希望直接导出而不需要先查询的场景<br>在导出之前会检测filter value是否被更改<br>若被更改，执行一次refetch后，延迟300ms再执行导出<br> | boolean         |        |      |



## Service\<T>

| 参数         | 说明                                         | 类型                                                         | 默认值 | 必填 |
| ------------ | -------------------------------------------- | ------------------------------------------------------------ | ------ | ---- |
| list         | 查询，支持filter与分页                       | (filterParams?: PlainObj, pageIndexOrLastItemId?: number \| string \| null, pageSize?: number) => Promise\<T[]\> |        | true |
| create       | 增加                                         | (params: PlainObj) => Promise                                |        |      |
| update       | 修改                                         | (id: UniqueId, params: PlainObj, record: T) => Promise       |        |      |
| delete       | 删除                                         | (id: UniqueId \| UniqueId[], record: T) => Promise           |        |      |
| customSubmit | 自定义提交，会覆盖默认create与update的action | (params: PlainObj, status: 'create' \| 'update', record: T \| null) => Promise |        |      |



## ActionConfig\<T>

| 参数                | 说明                   | 类型                  | 默认值                  | 必填 |
| ------------------- | ---------------------- | --------------------- | ----------------------- | ---- |
| actions             | action数组             | Actions\<T>           |                         |      |
| cellProps           | ag-grid的column        | ColDef\<T>            |                         |      |
| deleteConfirmSuffix | 删除二次提醒的文案后缀 | (record: T) => string | isId为true的key对应的值 |      |



## Actions\<T>

```typescript
type Actions<T = any> = (BuiltInAction | CommonAction<T>)[]
```



## BuiltInAction

```typescript
type BuiltInAction = 'create' | 'update' | 'delete'
```



## CommonAction\<T>

| 参数         | 说明                                                      | 类型                                              | 默认值 | 必填 |
| ------------ | --------------------------------------------------------- | ------------------------------------------------- | ------ | ---- |
| key          | 唯一key,不可与BuiltInAction重复                           | string \| number                                  |        | true |
| label        | action的title，支持字符串与函数形式                       | string \| ( (record: T) => string )               |        | true |
| action       | 自定义action函数                                          | (record: T) => void                               |        | true |
| confirmTitle | 不为undefined时会增加二次确认，使用了antd  Popconfirm组件 | string \|( (record: T) => string )                |        |      |
| type         | 透传给Typography的值                                      | 'secondary' \| 'success' \| 'warning' \| 'danger' |        |      |



## DataDefination\<T>

| 参数    | 说明                     | 类型                         | 默认值 | 必填 |
| ------- | ------------------------ | ---------------------------- | ------ | ---- |
| defs    | DataDef数组，详见DataDef | DataDef\<T>[]                |        | true |
| presets |                          | PresetItem[] \| PresetConfig |        |      |



## PresetItem

| 参数   | 说明                                              | 类型                               | 默认值 | 必填 |
| ------ | ------------------------------------------------- | ---------------------------------- | ------ | ---- |
| key    | key值，与CommonConfig中的persetKey相对应          | string                             |        | true |
| getter | 预制数据getter，支持同步和异步（返回一个promise） | () => unknown \| Promise\<unknown> |        | true |



## PresetConfig

| 参数  | 说明                                                | 类型         | 默认值 | 必填 |
| ----- | --------------------------------------------------- | ------------ | ------ | ---- |
| data  | key值，与CommonConfig中的persetKey相对应            | PresetItem[] |        | true |
| fresh | 若设为true，则每次新增/编辑时都会重新请求presetData | boolean      |        |      |



## DataDef\<T>

DataDef\<T>为ag-grid的ColDef\<T>的扩展，以下只列出扩展的API

| 参数         | 说明                                                         | 类型                                                         | 默认值 | 必填 |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------ | ---- |
| dataType     | dataType不为undifined的字段会出现在表单中<br>除custom类型外，其余为内置类型 | string \| number \| enum \| boolean \| tree \| time \| timeRange \| longString \|  \| img \| custom |        |      |
| CustomDt     | 自定义数据层中间件，必须继承BaseDataType，通常不会使用       | BaseDataType                                                 |        |      |
| isId         | id唯一标识，在具有删、改行为的模型中有且仅有一个为true       | boolean                                                      |        |      |
| commonConfig | 通用配置项                                                   | CommonConfig                                                 |        |      |
| cellConfig   | 表格配置项，与字段在表格中的渲染形式相关                     | CellConfig\<T>                                               |        |      |
| formConfig   | 表单配置项，影响字段在表单中的行为                           | FormConfig\<T>                                               |        |      |
| searchConfig | 搜索配置项，影响字段在搜索栏中的行为                         | SearchConfig\<T>                                             |        |      |



## CommonConfig

| 参数                | 说明                                                         | 类型                 | 默认值       | 必填 |
| ------------------- | ------------------------------------------------------------ | -------------------- | ------------ | ---- |
| presetKey           | 对于需要使用预制数据的dateType必传，如Select，Cascader等组件的options来自预制数据，值为PresetItem中的key | string               |              |      |
| valueUnit           | 用于前后端通信的时间单位，当dateType为时间类型时有效         | 's' \| 'ms' \| 'us'  |              |      |
| rangeCase           | 当dataType为timeRange时，添加start与end前缀或后缀（取决于rangePosition，默认后缀），生成一对key | RangeCase            |              |      |
| rangePosition       | 添加start与end的位置，默认为after                            | 'before' \| 'after'  |              |      |
| multipleValue       | 适用于dataType为enum、tree等支持多选的表单组件               | boolean              |              |      |
| primitiveType       | 高级数据类型（如tree、enum、time等）的原始数据类型，需要与服务端进行确认 | 'string' \| 'number' |              |      |
| serverTimeFormatter | 当时间类型（time、timeRange）的primitiveType为string时，需要设置传给服务端的日期格式化参数 | string               | ’YYYY/MM/DD‘ |      |



## CellConfig\<T>

| 参数            | 说明                                        | 类型                                                         | 默认值 | 必填 |
| --------------- | ------------------------------------------- | ------------------------------------------------------------ | ------ | ---- |
| formatter       | 格式化                                      | (defaultFormattedValue: any, item: T, presetData: PresetData, rawValue: any) => string |        |      |
| renderCell      | 自定义render，优先级大于formatter           | (value: any, item: T, presetData: PresetData) => ReactNode   |        |      |
| enableExport    | 控制字段是否需要导出                        | boolean                                                      |        |      |
| headerNameStart | dataType为timeRange时，开始时间的headerName | string                                                       |        |      |
| headerNameEnd   | dataType为timeRange时，结束时间的headerName | string                                                       |        |      |
| exportFormatter | 导出时的格式化函数                          | (originalFieldValue: any, item: T) => string \|number        |        |      |
| exportRaw       | 为true时，直接导出原始值                    | boolean                                                      |        |      |



## CustomProps\<T>

```typescript
type CustomProps<T> = PlainObj | ((dataDef: DataDef<T>, presetData: PresetData) => PlainObj)
```



## FormConfig\<T>

| 参数             | 说明                                                         | 类型                                                         | 默认值 | 必填 |
| :--------------- | :----------------------------------------------------------- | ------------------------------------------------------------ | ------ | ---- |
| renderedPhase    | 控制表单元素的渲染时机（create或update阶段），传入null则始终不渲染，传入boolean则根据boolean的值进行渲染，默认始终渲染 | 'create' \| 'update' \| null \| boolean                      |        |      |
| customRender     | 自定义表单元素渲染                                           | (dataDef: DataDef\<T>, presetData: PresetData, form: RcFormInstance) => ReactNode |        |      |
| itemProps        | 自定义表单Item元素Form.Item props                            | CustomProps\<T>                                              |        |      |
| componentProps   | 自定义表单元素props                                          | CustomProps\<T>                                              |        |      |
| transformKey     | 表单key -> 服务端key，默认值为field                          | string                                                       |        |      |
| transformValue   | 表单value -> 服务端value，其中表单value已经过数据中间层处理  | (value: any, presetData: PresetData) => any                  |        |      |
| getFieldValue    | 服务端value -> 表单value，其中服务端value已经过数据中间层处理 | (value: any, record: T, presetData: PresetData) => any       |        |      |
| customLabel      | 默认为headerName                                             | ReactNode                                                    |        |      |
| allowServerClear | 当表单为空值时，数据中间层会根据相应的dataType传一个兜底值给服务端，用于清空该字段，allowServerClear默认为true |                                                              | true   |      |
| dynamic          | 表单元素动态渲染，内部实现用到了DynamicItem                  | { <br>dependencies: DynamicItemProps['dependencies']<br><br>when: DynamicItemProps['when']<br><br>only?: 'search' \| 'popup'<br>} |        |      |
| upload           | 图片上传相关配置，当dataType为img时必传                      | { <br>action: UploadProps['action']<br><br>getSrc: (response: any) => string<br>} |        |      |



## DynamicItemProps\<T>

DynamicItem组件的props，继承自antd的FormItemProps，下面仅列出继承部分

| 参数         | 说明                                                   | 类型                                               | 默认值 | 必填 |
| ------------ | ------------------------------------------------------ | -------------------------------------------------- | ------ | ---- |
| dependencies | 动态渲染依赖的field                                    | string \| string[]                                 |        | true |
| children     |                                                        | ReactNode                                          |        |      |
| when         | 条件函数，返回true时渲染表单，与customRender二者选其一 | (values: any[], rcForm: RcFormInstance) => boolean |        |      |
| customRender | 自定义render，when为false时必传                        | boolean                                            |        |      |



## SearchConfig\<T>

| 参数           | 说明                                                     | 类型            | 默认值 | 必填 |
| :------------- | :------------------------------------------------------- | --------------- | ------ | ---- |
| enabled        | 是否允许搜索                                             | boolean         |        | true |
| placeholder    | 仅对搜索元素生效，不影响popup的                          | string          |        |      |
| itemProps      | 仅对搜索元素生效，并且会覆盖formConfig下的itemProps      | CustomProps\<T> |        |      |
| componentProps | 仅对搜索元素生效，并且会覆盖formConfig下的componentProps | CustomProps\<T> |        |      |
| label          | 自定义label，仅对搜索元素生效                            | string          |        |      |



## Dictionary

```typescript
type Dictionary = Record<'translation' | 'raw', Record<string, string>>
```



## ModelInstance\<T>

对Model使用useRef可获取到instance，暴露以下api

| 参数          | 说明                                                         | 类型                                                         |
| :------------ | :----------------------------------------------------------- | ------------------------------------------------------------ |
| refetch       | 重新请求，可携带查询参数params，不支持分页                   | (params?: PlainObj) => Promise\<any>                         |
| reload        | 重置，会清空缓存（分页内容、搜索字段等）                     | string                                                       |
| getDataSource | 获取数据源                                                   | () => T[]                                                    |
| getPresetData | 获取预制数据                                                 | () => PresetData                                             |
| getGridApi    | 返回gridRef.current，若在表格onGridReady之前调用，则会返回undefined | () => GridApi \| undefined                                   |
| getDictionary | 获取字典，在使用xlsx进行自定义导出时，转换column的中文可能会用到 | () => Dictionary                                             |
| getForms      | 获取模型中的forms，包含popup form和search form               | () => { popup: RcFormInstance; search: RcFormInstance }      |
| manualAction  | 将增、删、改的操作暴露给外部                                 | { <br/>create: Function<br/>update: Function<br/>delete: Function<br/>submit: Function<br/>} |

delete: Function<br/>

# 其他通用组件、方法



## AgGridTable

React组件，对ag-grid的简单封装，无特殊逻辑



## DynamicItem

React组件，动态表单组件



## FormModal

React组件，使用了DynamicItem实现



## usePopup\<T>

React Hook，对popup类型（modal、drawer等）的简单封装

```typescript
function usePopup<T>(): usePopupResult<T> 

type usePopupResult<T> = [PopupValues<T>, PopupAction<T>]

type PopupStatus = 'create' | 'update' | null

type PopupValues<T> = {
  popupStatus: PopupStatus
  current: T | null
  popupProps: HookPopupProps
}

interface HookPopupProps {
  open: boolean
  onClose: () => void
}

type PopupAction<T> = (popup: PopupStatus, record?: T) => void
```



## useSelectableTable\<T>

行可选中表格的hook，返回getSelectedRows与ensureSelected两个方法

```typescript
interface Options {
  message?: {
    enabled?: boolean
    msg?: string
  }
}

function useSelectableTable<T>(ref: RefObject<ModelInstance<T>>, option?: Options): { getSelectedRows: Function; ensureSelected: Function }

type getSelectedRows<T> = () => T[]

type ensureSelected<T> = () => Promise<T[]>
```



## 工具库函数

| 方法名        | 说明                                                         | 类型                                                         |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| isPromiseLike |                                                              | (v: any): => v is PromiseLike\<unknown>                      |
| isEmptyArray  |                                                              | (v: any): => boolean                                         |
| isObj         |                                                              | (v: any): => boolean                                         |
| isEmptyObj    |                                                              | (v: any): => boolean                                         |
| isNil         |                                                              | (v: any): => boolean                                         |
| last          | 获取数组最后一个元素                                         | \<T>(arr: T[] \| null \| undefined): => NonNullable\<T> \| null |
| filterObj     | 删除对象中值为null 或undefined 或指定类型（specificEmptys数组）的属性，浅拷贝原对象 | \<T>(obj: T \| null \| undefined, specificEmptys?: any[]) => T |
| timeUtil      | 处理与时间相关的函数，依赖moment                             | { <br/>format: Function<br/>getTimeStamp: Function<br/>getFormValue: Function<br/>} |

