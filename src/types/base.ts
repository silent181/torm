import { FormInstance as FI } from 'antd'

export type TimeUnit = 's' | 'ms' | 'us'

export type PlainObj<V = any> = Record<string, V>

export type UniqueId = number | string

export type RcFormInstance = Omit<FI, 'scrollToField' | 'getFieldInstance'>

export type RangeCase = 'camelCase' | 'pascalCase' | 'capitalCase' | 'snakeCase' | 'paramCase' | 'constantCase'
