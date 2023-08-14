import { Service } from '../../src'

function resolve<T>(res?: T) {
  return new Promise<T | void>((_resolve) => {
    setTimeout(() => {
      _resolve(res)
    }, 1000)
  })
}

export type Hobby = {
  value: number
  label: string
}

export const hobbies = [
  {
    value: 1,
    label: '篮球',
  },
  {
    value: 2,
    label: '足球',
  },
  {
    value: 3,
    label: '羽毛球',
  },
  {
    value: 4,
    label: '网球',
  },
]

export const getHobbies = () => {
  return resolve(hobbies)

  // also works:
  // return hobbies;
}

export interface DataType {
  id?: number | string
  name: string

  age: number
  hobby: number
  hobbies: number[]
  married: boolean
  born: number
  params1?: any
  params2?: any
  params3?: any
  date_start?: number
  date_end?: number
  anotherStart?: number
  anotherEnd?: number
  department?: string
  departments?: string[]
  avatar?: string
}

export interface StandardResponse {
  code: number
}

export type UniqueId = number | string

const item: DataType = {
  id: 1,
  name: 'aa',
  anotherStart: 959702400000, // 2000/05/31
  anotherEnd: 1259702400000, // 2009/12/02
  age: 23,
  hobby: 1,
  hobbies: [2],
  married: true,
  params1: 111,
  params2: '111',
  params3: 111,
  born: 1292083200000, // 2010/12/12
  date_start: 959702400000, // 2000/05/31
  date_end: 1259702400000, // 2009/12/02
  department: '6b1a81bc1g481a71',
  departments: ['user:5', 'cc15g5984b743g6e', 'f9a82f1e6d254954'],
}

let data: DataType[] = [
  {
    id: 1,
    name: 'aa',
    anotherStart: 959702400000, // 2000/05/31
    anotherEnd: 1259702400000, // 2009/12/02
    age: 23,
    hobby: 1,
    hobbies: [2],
    married: true,
    params1: 111,
    params2: '111',
    params3: 111,
    born: 1292083200000, // 2010/12/12
    date_start: 959702400000, // 2000/05/31
    date_end: 1259702400000, // 2009/12/02
    department: '6b1a81bc1g481a71',
    departments: ['user:5', 'cc15g5984b743g6e', 'f9a82f1e6d254954'],
    avatar: 'https://static.pqgbygf.cn/decorate-file/prod/23/c728d112-2699-4657-a4e6-bd1d347d269e%7D',
  },
  {
    id: 2,
    name: 'bb',
    anotherStart: 959702400000, // 2000/05/31
    anotherEnd: 1259702400000, // 2009/12/02
    age: 99,
    hobby: 2,
    hobbies: [2, 1],
    married: false,
    params1: 222,
    params2: '222',
    params3: 222,
    born: 1392083200000, // 2014/02/11
    date_start: 1059702400000,
    date_end: 1359702400000,
    department: '5d15afe85gc2db1c',
    departments: ['cbb1b54dcgbb2d68', 'user:183', '41g675ad4gbf5fa2'],
    avatar: 'https://static.pqgbygf.cn/decorate-file/prod/23/c728d112-2699-4657-a4e6-bd1d347d269e%7D',
  },
  {
    id: 3,
    name: 'cc',
    anotherStart: 959702400000, // 2000/05/31
    anotherEnd: 1259702400000, // 2009/12/02
    age: 11,
    hobby: 3,
    hobbies: [1, 3, 4],
    married: false,
    params1: 333,
    params2: '333',
    params3: 333,
    born: 1492083200000, // 2017/04/13
    date_start: 1159702400000,
    date_end: 1459702400000,
    department: 'c7f74c79eg2f5efg',
    departments: ['user:5', 'e24a39d32851c63f', 'user:284'],
    avatar: 'https://static.pqgbygf.cn/decorate-file/prod/23/c728d112-2699-4657-a4e6-bd1d347d269e%7D',
  },
]

// 测试分页
let paginationData: DataType[] = Array.from({ length: 92 }).map((_, i) => {
  return {
    ...item,
    id: i,
    name: `${item.name}-${i}`,
  }
})

const getSetData =
  (pagination = false) =>
  (newData: any) => {
    if (pagination) {
      paginationData = newData
    } else {
      data = newData
    }
  }

export const getService = (pagination = false) => {
  const setData = getSetData(pagination)
  const getData = () => (pagination ? paginationData : data)

  const service: Service<DataType> = {
    list: (params?: Partial<DataType>, pageParam?: number | string | null, pageSize = 20) => {
      const page = pageParam
      console.log('service list', params, page)

      let ret = getData()
      if (typeof page === 'number') {
        const start = (page - 1) * pageSize
        const end = start + pageSize

        ret = ret.slice(start, end)
      }

      if (!params || Object.keys(params).length === 0) {
        return resolve(ret) as Promise<DataType[]>
      }

      const filterKeys = Object.keys(params)

      // 简单搜索mock，匹配key === value
      const result = ret.filter((item) => {
        return filterKeys.every((k) => item?.[k as keyof DataType] === params?.[k as keyof DataType])
      })

      return resolve(result) as Promise<DataType[]>
    },

    create: (params: Partial<DataType>) => {
      const data = getData()
      const newData = [
        ...data,
        {
          params1: 0,
          params2: '',
          params3: 0,
          ...params,
          // @ts-ignore
          id: data.length ? data[data.length - 1].id! + 1 : 1,
        },
      ] as DataType[]

      setData(newData)

      return resolve()
    },

    delete: (id) => {
      const data = getData()
      const newData = data.filter((d) => d.id !== id)

      setData(newData)

      return resolve()
    },

    update: (id, params: Partial<DataType>) => {
      const data = getData()
      const index = data.findIndex((d) => d.id === id)

      setData([
        ...data.slice(0, index),
        {
          ...data[index],
          ...params,
          id,
        },
        ...data.slice(index + 1),
      ])

      return resolve()
    },
  }

  return service
}
