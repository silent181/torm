import { ReactNode } from 'react'

export interface HeaderConfig<P extends 'beforeSearch' | 'afterSearch'> {
  position: P
  render: () => ReactNode
}

export type HeaderProps =
  | [HeaderConfig<'beforeSearch'>]
  | [HeaderConfig<'afterSearch'>]
  | [HeaderConfig<'beforeSearch'>, HeaderConfig<'afterSearch'>]
  | [HeaderConfig<'afterSearch'>, HeaderConfig<'beforeSearch'>]
