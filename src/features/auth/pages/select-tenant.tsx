import { useNavigate } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Building2, LogOut } from 'lucide-react'

export function Component() {
  const { profile, selectTenant, logout } = useAuth()
  const navigate = useNavigate()

  const activeMemberships =
    profile?.tenantMembers.filter((m) => m.status === 'ACTIVE' && m.tenant.status === 'ACTIVE') || []

  const handleSelect = (tenantId: number) => {
    // TODO: Xử lý thực tế (call API, lưu store)
    selectTenant(tenantId)
    navigate('/app/tong-quan')
  }

  const handleLogout = () => {
    logout()
    navigate('/dang-nhap')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Chọn Tổ chức / Nhà trọ</CardTitle>
          <CardDescription>Vui lòng chọn một tổ chức để tiếp tục làm việc</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeMemberships.length > 0 ? (
            <div className="space-y-3">
              {activeMemberships.map((membership) => (
                <Button
                  key={membership.id}
                  variant="outline"
                  className="hover:border-primary hover:bg-primary/5 flex h-auto w-full items-center justify-start gap-4 px-4 py-4"
                  onClick={() => handleSelect(membership.tenantId)}
                >
                  <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 overflow-hidden text-left">
                    <div className="truncate text-base font-semibold">{membership.tenant.name}</div>
                    <div className="text-muted-foreground text-xs capitalize">
                      Vai trò: {membership.role.name.toLowerCase()}
                    </div>
                  </div>
                </Button>
              ))}

              <Button
                className="bg-primary font-label-md mt-6 w-full text-white hover:opacity-90"
                onClick={() => selectedTenant && handleSelect(selectedTenant)}
                disabled={!selectedTenant}
              >
                Tiếp tục
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                className="text-muted-foreground font-label-md mt-2 w-full"
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="text-muted-foreground py-6 text-center">
              Tài khoản của bạn hiện chưa được phân quyền vào bất kỳ tổ chức nào.
              <div className="mt-4 flex justify-center pt-4">
                <Button variant="ghost" className="text-muted-foreground" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Quay lại trang đăng nhập
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-center border-t pt-4">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" /> Quay lại trang đăng nhập
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
