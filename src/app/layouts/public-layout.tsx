import { Outlet } from 'react-router'
import { MarketplaceHeader } from '@/features/marketplace/components/marketplace-header'
import { MarketplaceFooter } from '@/features/marketplace/components/marketplace-footer'
import { FloatingChatWidget } from '@/features/chat/components/floating-chat-widget'

/**
 * Layout công khai cho marketplace.
 */
export function Component() {
  return (
    <div className="min-h-screen flex flex-col font-body-md text-on-background bg-background">
      <MarketplaceHeader />
      <main className="flex-1 pt-topbar-height">
        <Outlet />
      </main>
      <MarketplaceFooter />
      <FloatingChatWidget />
    </div>
  )
}
