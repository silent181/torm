import moment, { Moment } from 'moment'

import { dateFormatter } from '../constant'
import { TimeUnit } from '../types'

export function isPromiseLike(v: any): v is PromiseLike<unknown> {
  if (v && v.then && typeof v.then === 'function') {
    return true
  }

  return false
}

export function isEmptyArray(val: any) {
  return Array.isArray(val) && val.length === 0
}

export function isObj(val: any) {
  return Object.prototype.toString.call(val) === 'object'
}

// 不严谨，没有剔除enumerable之外的属性
export function isEmptyObj(val: any) {
  return isObj(val) && Object.keys(val).length === 0
}

// 删除对象中值为null 或undefined 或指定类型（specificEmptys数组）的属性，浅拷贝原对象
export function filterObj<T extends Record<string, any>>(
  obj: T | null | undefined,
  specificEmptys?: any[], // 指定额外需要过滤的空值，可填入['', 0, [], {}] 等等
): T {
  if (!obj) {
    return {} as T
  }

  const contains = (specific: any, val: any) => {
    if (!Array.isArray(specific)) {
      return false
    }

    if (isEmptyArray(val)) {
      return specific.some(isEmptyArray)
    } else if (isEmptyObj(val)) {
      return specific.some(isEmptyObj)
    }

    return specific.includes(val)
  }

  const shallowCopyed = { ...obj }

  Object.entries(shallowCopyed).forEach(([key, val]) => {
    if (isNil(val) || contains(specificEmptys, val)) {
      delete shallowCopyed[key]
    }
  })

  return shallowCopyed
}

interface FormatOption {
  valueUnit?: TimeUnit
  formatter?: string
}

type Normalizer = Record<TimeUnit, (v: number) => number>

type KnownValueType = 'string' | 'number'

const TimeUnitNormalizer: Record<'fromValue' | 'fromObj', Normalizer> = {
  fromValue: {
    s: (v) => v * 1000,
    ms: (v) => v,
    us: (v) => Math.floor(v / 1000),
  },

  fromObj: {
    s: (v) => Math.floor(v / 1000),
    ms: (v) => v,
    us: (v) => v * 1000,
  },
}

function formatTime(value: number | string | null | undefined, opts: FormatOption = {}) {
  if (!value) {
    return ''
  }

  value = Number(value)

  const defaultOpts = {
    valueUnit: 's' as TimeUnit,
    formatter: dateFormatter,
  }

  const { valueUnit, formatter } = { ...defaultOpts, ...opts }

  const msValue = TimeUnitNormalizer.fromValue[valueUnit](value)

  return moment(msValue).format(formatter)
}

function getTimeStamp(obj: Moment | null | undefined, opts: { returnUnit?: TimeUnit } = {}) {
  if (!obj) {
    return obj
  }

  const defaultOpts = {
    returnUnit: 's' as TimeUnit,
  }

  const { returnUnit } = { ...defaultOpts, ...opts }

  const msValue = obj.valueOf()

  return TimeUnitNormalizer.fromObj[returnUnit](msValue)
}

function value2TimeObj(
  value: number | string | null | undefined,
  unit: TimeUnit = 's',
  knownValueType: KnownValueType = 'number',
) {
  if (!value) {
    return value
  }

  if (knownValueType === 'string') {
    return moment(value)
  }

  value = Number(value)

  const msValue = TimeUnitNormalizer.fromValue[unit](value)

  return moment(msValue)
}

export const timeUtil = {
  format: formatTime,
  getTimeStamp,
  getFormValue: value2TimeObj,
}

export function isNil(val: any) {
  return val === null || val === undefined
}

export function last<T>(arr: T[] | null | undefined) {
  if (!Array.isArray(arr)) {
    return null
  }

  return arr[arr.length - 1] ?? null
}
