/**
 * 常用的dataDef
 */
import { CellConfig, DataDef } from '../types'

export const wrapText = {
  wrapText: true,
  autoHeight: true,
}

export const requiredProps = {
  itemProps: {
    rules: [
      {
        required: true,
      },
    ],
  },
}

export const exportCellConfig = <T extends any = any>(opts?: Pick<CellConfig<T>, 'exportFormatter' | 'exportRaw'>) => {
  return {
    enableExport: true,
    ...opts,
  }
}

export const withExport = <T extends any = any>(opts?: Pick<CellConfig<T>, 'exportFormatter' | 'exportRaw'>) => {
  return {
    cellConfig: exportCellConfig(opts),
  }
}

export const commonStringDef = (
  field: string,
  headerName: string,
  opts: { width?: number; isLong?: boolean; required?: boolean; wrap?: boolean; export?: boolean } = {},
): DataDef => {
  const getWrapText = () => {
    if (opts.wrap) {
      return wrapText
    }

    if (opts.isLong && opts.wrap !== false) {
      return wrapText
    }

    return {}
  }

  const ret: DataDef = {
    field,
    headerName,
    dataType: opts?.isLong ? 'longString' : 'string',
    width: opts?.width || 200,
    ...getWrapText(),
    ...(opts.export === false ? {} : withExport()),
  }

  if (opts?.required) {
    ret.formConfig = {
      ...requiredProps,
    }
  }

  return ret
}
