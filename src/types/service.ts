import { PlainObj, UniqueId } from './base'
import { PopupStatus } from './popup'

export interface Service<T = any> {
  pageIndex?: number
  list: (filterParams?: PlainObj, pageIndexOrLastItemId?: number | string | null, pageSize?: number) => Promise<T[]>
  create?: (params: PlainObj) => Promise<any>
  update?: (id: UniqueId, params: PlainObj, record: T) => Promise<any>
  delete?: (deleteParams: UniqueId | UniqueId[], record: T) => Promise<any>
  customSubmit?: (params: PlainObj, status: Exclude<PopupStatus, null>, record: T | null) => Promise<any>
}
