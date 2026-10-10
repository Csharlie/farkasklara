import type { ComponentType } from 'react'
import { FeaturesBlock, cn, type FeatureCardProps, type FeaturesBlockProps } from '@spektra/components'
import { sectionSpacing } from '../../theme/layout'
import { iconNames, isIconName, type IconName } from '../shared/icon-paths'
import { Icon } from '../shared/icons'

/** One feature card: serializable — the icon is a key, not a component. */
export type FkFeatureItem = Omit<FeatureCardProps, 'className' | 'icon'> & { iconName?: string }

/**
 * Platform FeaturesBlock composed with the client section rhythm. The
 * component stays the platform's; the client adds spacing, background tone
 * and maps icon keys to its inline icon set.
 */
export type FkFeaturesData = Omit<FeaturesBlockProps, 'features'> & {
  features: FkFeatureItem[]
  tone?: 'plain' | 'warm'
}

/**
 * One stable component per icon key, created once at module load.
 * FeatureCard passes its own size/colour classes; these icons keep their own
 * look instead (large thin line icon, ink colour — see index.css).
 */
const featureIcons = Object.fromEntries(
  iconNames.map((name) => {
    function FeatureIcon() {
      return <Icon name={name} className="size-11 text-foreground" />
    }
    FeatureIcon.displayName = `FeatureIcon(${name})`
    return [name, FeatureIcon]
  }),
) as unknown as Record<IconName, ComponentType<{ className?: string }>>

export function FkFeaturesBlock({ tone, className, features, ...props }: FkFeaturesData) {
  const items = features.map(({ iconName, ...feature }) => ({
    ...feature,
    // FeatureCardProps.icon is typed as LucideIcon; any component taking className renders.
    icon: isIconName(iconName) ? (featureIcons[iconName] as unknown as FeatureCardProps['icon']) : undefined,
  }))
  return (
    <FeaturesBlock
      {...props}
      features={items}
      className={cn(sectionSpacing, tone === 'plain' && 'bg-background', className)}
    />
  )
}
