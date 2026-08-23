import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'
import { useRegisterTenant } from '@/shared/api/tenants'
import { apiClient } from '@/shared/api/axios-client'
import type { UserProfile, TokenPair } from '@/shared/types/auth'
import { getAccessToken, getRefreshToken } from '@/app/config/session.store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowRight, Building2, LogOut, Plus } from 'lucide-react'

/**
 * Trang chọn Tổ chức / Nhà trọ sau khi đăng nhập.
 * User chọn tenant rồi bấm "Tiếp tục" để vào hệ thống quản lý.
 */
export function Component() {
  const { profile, selectTenant, logout, establishSession } = useAuth()
  const navigate = useNavigate()
  const registerTenantMutation = useRegisterTenant()

  /** ID tenant đang được chọn (radio-style) */
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null)
  
  // State cho dialog tạo mới nhà trọ
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTenantName, setNewTenantName] = useState('')

  const activeMemberships =
    profile?.tenantMembers.filter((m) => m.status === 'ACTIVE' && m.tenant.status === 'ACTIVE') || []

  /** Xác nhận chọn tenant, lưu vào store và điều hướng vào dashboard */
  const handleConfirm = () => {
    if (!selectedTenantId) return
    selectTenant(selectedTenantId)
    navigate('/tong-quan')
  }

  /** Đăng xuất và quay về trang đăng nhập */
  const handleLogout = () => {
    logout()
    navigate('/dang-nhap')
  }

  /** Xử lý tạo mới Tổ chức/Nhà trọ */
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTenantName.trim()) return

    try {
      await registerTenantMutation.mutateAsync({ tenantName: newTenantName })
      
      // Sau khi tạo thành công, fetch lại profile để lấy membership mới
      const profileResponse = await apiClient.get<UserProfile>('/auth/profile')
      const tokens: TokenPair = { 
        accessToken: getAccessToken()!, 
        refreshToken: getRefreshToken()! 
      }
      
      // establishSession sẽ tự động chọn tenant nếu chỉ có 1
      establishSession(tokens, profileResponse.data)
      setIsDialogOpen(false)
      
      // Nếu user có nhiều hơn 1 tenant sau khi tạo thì cần chọn thủ công
      // Nhưng thông thường establishSession sẽ auto chọn nếu có 1
      // Ta an toàn gọi reload hoặc điều hướng
      window.location.href = '/tong-quan'
    } catch (error) {
      console.error('Failed to create tenant:', error)
    }
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
                  className={`flex h-auto w-full items-center justify-start gap-4 px-4 py-4 ${
                    selectedTenantId === membership.tenantId
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'hover:border-primary hover:bg-primary/5'
                  }`}
                  onClick={() => setSelectedTenantId(membership.tenantId)}
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
                  {selectedTenantId === membership.tenantId && (
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                      check_circle
                    </span>
                  )}
                </Button>
              ))}

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex h-auto w-full items-center justify-center gap-2 px-4 py-4 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5">
                    <Plus className="h-5 w-5" />
                    Thêm nhà trọ / Tạo mới
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateTenant}>
                    <DialogHeader>
                      <DialogTitle>Tạo Tổ chức / Nhà trọ mới</DialogTitle>
                      <DialogDescription>
                        Nhập tên tổ chức hoặc khu trọ của bạn để bắt đầu quản lý.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="tenantName">Tên nhà trọ <span className="text-red-500">*</span></Label>
                        <Input
                          id="tenantName"
                          placeholder="VD: Khu Trọ Cao Cấp Quận 1"
                          value={newTenantName}
                          onChange={(e) => setNewTenantName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                      <Button type="submit" disabled={!newTenantName.trim() || registerTenantMutation.isPending}>
                        {registerTenantMutation.isPending ? 'Đang tạo...' : 'Tạo mới'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Button
                className="bg-primary font-label-md mt-6 w-full text-white hover:opacity-90"
                onClick={handleConfirm}
                disabled={!selectedTenantId}
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
            <div className="text-muted-foreground py-6 text-center space-y-4">
              <p>Tài khoản của bạn hiện chưa được phân quyền vào bất kỳ tổ chức nào.</p>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Tạo mới Nhà trọ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateTenant}>
                    <DialogHeader>
                      <DialogTitle>Tạo Tổ chức / Nhà trọ mới</DialogTitle>
                      <DialogDescription>
                        Nhập tên tổ chức hoặc khu trọ của bạn để bắt đầu quản lý.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="tenantName">Tên nhà trọ <span className="text-red-500">*</span></Label>
                        <Input
                          id="tenantName"
                          placeholder="VD: Khu Trọ Cao Cấp Quận 1"
                          value={newTenantName}
                          onChange={(e) => setNewTenantName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                      <Button type="submit" disabled={!newTenantName.trim() || registerTenantMutation.isPending}>
                        {registerTenantMutation.isPending ? 'Đang tạo...' : 'Tạo mới'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="flex justify-center pt-2">
                <Button variant="ghost" className="text-muted-foreground" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Quay lại trang đăng nhập
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
