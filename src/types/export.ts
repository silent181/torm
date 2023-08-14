import { BaseExportParams } from "ag-grid-community"

export type ExportOptions = {
  enabled: boolean
  params?: BaseExportParams

  /**
   * 兼容一些业务方希望直接导出而不需要先查询的场景
   * 在导出之前会检测filter value是否被更改
   * 若被更改，执行一次fetch后再执行导出
   */
  fetchBeforeExport?: boolean

  /**
   * 是否导出excel，若为false则导出csv，默认false，设为true时需要开启enterprise功能才生效
   */
  excel?: boolean
}