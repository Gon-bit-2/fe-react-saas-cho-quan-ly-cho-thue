import { useNavigate } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, LogOut } from 'lucide-react'

export function Component() {
  const { profile, selectTenant, logout } = useAuth()
  const navigate = useNavigate()

  const activeMemberships = profile?.tenantMembers.filter(
    (m) => m.status === 'ACTIVE' && m.tenant.status === 'ACTIVE'
  ) || []

  const handleSelect = (tenantId: number) => {
    selectTenant(tenantId)
    navigate('/app/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Chọn Tổ chức / Nhà trọ</CardTitle>
          <CardDescription>
            Vui lòng chọn một tổ chức để tiếp tục làm việc
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeMemberships.length > 0 ? (
            <div className="space-y-3">
              {activeMemberships.map((membership) => (
                <Button
                  key={membership.id}
                  variant="outline"
                  className="w-full h-auto py-4 px-4 flex items-center justify-start gap-4 hover:border-primary hover:bg-primary/5"
                  onClick={() => handleSelect(membership.tenantId)}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="text-left flex-1 overflow-hidden">
                    <div className="font-semibold text-base truncate">
                      {membership.tenant.name}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      Vai trò: {membership.role.name.toLowerCase()}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Tài khoản của bạn hiện chưa được phân quyền vào bất kỳ tổ chức nào.
            </div>
          )}

          <div className="pt-4 border-t mt-4 flex justify-center">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-2" /> Quay lại trang đăng nhập
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
