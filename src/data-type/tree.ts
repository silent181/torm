import { Cascader, CascaderProps } from 'antd'

import { isNil } from '../utils'
import { Behaviors, WithPresets } from './base'

type Options = CascaderProps<TreeNode>['options']

type Val = string | number
export interface TreeNode {
  value: Val
  label: string
  isLeaf?: boolean
  children?: TreeNode[]
  __parent?: TreeNode
}

export interface TreeNodeWithPath {
  node: TreeNode | null
  path: Val[]
}

export default class TreeType extends WithPresets<Options> implements Behaviors {
  private findTreeNodeDFS(input: TreeNode[], id: Val | undefined | null): TreeNodeWithPath {
    const emptyResult: TreeNodeWithPath = {
      node: null,
      path: [],
    }

    if (!id) {
      return emptyResult
    }

    let stack = [...input]

    while (stack.length) {
      const item = stack.shift()!

      if (id === item.value) {
        const path = [item.value]
        let parent = item.__parent

        while (parent) {
          path.unshift(parent.value)
          parent = parent.__parent
        }

        return {
          node: item,
          path,
        }
      }

      const children = item?.children?.map?.((v) => ({ ...v, __parent: item }))

      if (children && children.length) {
        stack = [...children, ...stack]
      }
    }

    return emptyResult
  }

  private last(arr: any) {
    return Array.isArray(arr) ? arr?.[arr.length - 1] : undefined
  }

  getComponent() {
    return Cascader
  }

  defaultProps() {
    const dataDef = this.getDef()
    let ret: CascaderProps<TreeNode> = {
      ...super.defaultProps(),
      allowClear: true,
      showSearch: true,
      changeOnSelect: true,
    }

    const options = this.getCurrentPreset()

    if (options && options.length > 0) {
      ret = {
        ...ret,
        options,
      }
    }

    if (dataDef.commonConfig?.multipleValue) {
      ret = {
        ...ret,
        multiple: true,
      } as CascaderProps<TreeNode>
    }

    return ret
  }

  isEmpty(formValue: Val | undefined) {
    return isNil(formValue) || (Array.isArray(formValue) && formValue.length === 0)
  }

  emptyValue() {
    const def = this.getDef()
    if (def.commonConfig?.multipleValue) {
      return []
    }

    return this.getPrimitiveEmptyValue() ?? ''
  }

  formatter(serverVal: Val | Val[]) {
    const def = this.getDef()
    const options = this.getCurrentPreset()

    if (!options || options.length === 0) {
      return serverVal
    }

    if (def.commonConfig?.multipleValue) {
      return Array.isArray(serverVal) ? serverVal.map((v) => this.findTreeNodeDFS(options, v)?.node?.label) : ''
    }

    return this.findTreeNodeDFS(options, serverVal as Val)?.node?.label
  }

  formValueGetter(serverVal: Val | Val[]) {
    const def = this.getDef()

    const options = this.getCurrentPreset()

    if (!options || options.length === 0) {
      return serverVal
    }

    if (def.commonConfig?.multipleValue) {
      return Array.isArray(serverVal) ? serverVal.map((v) => this.findTreeNodeDFS(options, v)?.path) : ''
    }

    return this.findTreeNodeDFS(options, serverVal as Val)?.path
  }

  paramGetter(formVal: Val[] | Val[][] | undefined | '') {
    const options = this.getCurrentPreset()

    if (!options || options.length === 0) {
      return formVal
    }

    const def = this.getDef()

    if (def.commonConfig?.multipleValue) {
      return (formVal as Val[][])?.map((path) => this.last(path))
    }

    return this.last(formVal) || this.emptyValue()
  }
}
