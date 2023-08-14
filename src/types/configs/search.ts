import { CustomProps } from '../dataDef'

export type SearchConfig<T> = {
  enabled: boolean

  /**
   * 仅对search元素生效
   */
  placeholder?: string

  /**
   * 仅对search元素生效，并且会覆盖formConfig下的itemProps
   */
  itemProps?: CustomProps<T>

  /**
   * 仅对search元素生效，并且会覆盖formConfig下的componentProps
   */
  componentProps?: CustomProps<T>

  /**
   * 仅对search元素生效
   */
  label?: string
}
