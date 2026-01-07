/**
 * 错误边界组件
 * 1. 捕获JavaScript错误 ：当子组件树中的任何组件发生JavaScript错误时，ErrorBoundary会捕获这些错误，防止整个应用崩溃。
 * 2. 显示友好的错误界面 ：当捕获到错误时，会显示一个用户友好的错误提示界面，而不是白屏或应用崩溃。
 */
import { formatErrorMessage } from '@core/utils'
import { Alert } from 'antd'
import { ComponentType, ReactNode } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'

const DefaultFallback: ComponentType<FallbackProps> = (props: FallbackProps): ReactNode => {
  const { error } = props
  return (
    <div>
      <Alert
        message={'似乎出现了一些问题...'}
        showIcon
        description={formatErrorMessage(error)}
        type="error"
      />
    </div>
  )
}

const ErrorBoundaryCustomized = ({
  children,
  fallbackComponent
}: {
  children: ReactNode
  fallbackComponent?: ComponentType<FallbackProps>
}) => {
  return <ErrorBoundary FallbackComponent={fallbackComponent ?? DefaultFallback}>{children}</ErrorBoundary>
}


export { ErrorBoundaryCustomized as ErrorBoundary }
