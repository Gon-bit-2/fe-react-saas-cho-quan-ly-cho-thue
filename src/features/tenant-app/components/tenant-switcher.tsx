import { useAuth } from '@/shared/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Building2, ChevronDown } from 'lucide-react'

export function TenantSwitcher() {
  const { profile, selectedMembership, selectTenant } = useAuth()

  // Find unique tenants the user has access to
  const availableTenants =
    profile?.tenantMembers.filter(
      (membership) => membership.status === 'ACTIVE' && membership.tenant.status === 'ACTIVE',
    ) ?? []
  const currentTenant = availableTenants.find((m) => m.tenantId === selectedMembership?.tenantId)

  if (availableTenants.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex max-w-[200px] items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <Building2 className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="truncate">
              {currentTenant?.tenant.name || `Tenant ${currentTenant?.tenantId || 'Unknown'}`}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel>Tổ chức của bạn</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableTenants.map((membership) => (
          <DropdownMenuItem
            key={membership.id}
            onClick={() => selectTenant(membership.tenantId)}
            className="flex cursor-pointer flex-col items-start gap-1"
          >
            <span className="font-medium">{membership.tenant.name || `Tenant ${membership.tenantId}`}</span>
            <span className="text-muted-foreground text-xs capitalize">Vai trò: {membership.role.name.toLowerCase()}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
