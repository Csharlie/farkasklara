import { FeaturesBlock, cn, type FeaturesBlockProps } from '@spektra/components'
import { sectionSpacing } from '../../theme/layout'

/**
 * Platform FeaturesBlock composed with the client section rhythm. The
 * component stays the platform's; the client only adds spacing and the
 * background tone (data `tone`).
 */
export type FkFeaturesData = FeaturesBlockProps & { tone?: 'plain' | 'warm' }

export function FkFeaturesBlock({ tone, className, ...props }: FkFeaturesData) {
  return (
    <FeaturesBlock
      {...props}
      className={cn(sectionSpacing, tone === 'plain' && 'bg-background', className)}
    />
  )
}
