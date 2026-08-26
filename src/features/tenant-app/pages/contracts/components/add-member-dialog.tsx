import { useState, useEffect } from 'react'
import { Search, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRentersControllerListForLandlord } from '@/shared/api/generated/renters/renters'
import { useAddContractMember } from '@/shared/api/contracts'
import { toast } from 'sonner'
import type { AddContractMemberBodyDTO } from '@/shared/api/generated/models/addContractMemberBodyDTO'

// Simple useDebounce hook inline
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export function AddMemberDialog({ contractId, children }: { contractId: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)

  // Ghost member form state
  const [ghostForm, setGhostForm] = useState({
    fullName: '',
    phone: '',
    age: '',
    identityCard: '',
  })

  const { data: rentersData, isLoading: isLoadingRenters } = useRentersControllerListForLandlord(
    { search: debouncedSearch, page: 1, limit: 10 },
    { query: { enabled: open } },
  )

  const { mutate: addMember, isPending: isAdding } = useAddContractMember(contractId)

  const handleAddExisting = (userId: number) => {
    addMember(
      { userId },
      {
        onSuccess: () => {
          toast.success('Thêm thành viên thành công!')
          setOpen(false)
          setSearchTerm('')
        },
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi thêm thành viên')
        },
      },
    )
  }

  const handleAddGhost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ghostForm.fullName || !ghostForm.phone || !ghostForm.identityCard) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.')
      return
    }

    const payload: any = {
      fullName: ghostForm.fullName,
      phone: ghostForm.phone,
      identityCard: ghostForm.identityCard,
    }
    if (ghostForm.age) {
      payload.age = Number(ghostForm.age)
    }

    addMember(payload as AddContractMemberBodyDTO, {
      onSuccess: () => {
        toast.success('Thêm thành viên thành công!')
        setOpen(false)
        setGhostForm({ fullName: '', phone: '', age: '', identityCard: '' })
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } }
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi thêm thành viên')
      },
    })
  }

  const handleGhostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGhostForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const renters =
    (rentersData as unknown as { data?: Array<{ id: number; fullName: string; email: string; phone?: string }> })
      ?.data || []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm thành viên</DialogTitle>
          <DialogDescription>Thêm người ở cùng vào hợp đồng này.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="existing" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Từ hệ thống</TabsTrigger>
            <TabsTrigger value="new">Thêm người mới</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Tìm kiếm khách thuê..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-[300px] min-h-[200px] space-y-2 overflow-y-auto rounded-md border border-slate-100 p-2">
              {isLoadingRenters ? (
                <div className="flex h-full items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : renters.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">Không tìm thấy khách thuê nào phù hợp.</div>
              ) : (
                renters.map((renter) => (
                  <div
                    key={renter.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage alt={renter.fullName} />
                        <AvatarFallback>{renter.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{renter.fullName}</span>
                        <span className="text-xs text-slate-500">
                          {renter.phone || renter.email || 'Chưa cập nhật TT'}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 shrink-0 bg-blue-50 text-blue-600 hover:bg-blue-100"
                      onClick={() => handleAddExisting(renter.id)}
                      disabled={isAdding}
                    >
                      Thêm
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-4 py-4">
            <form onSubmit={handleAddGhost} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={ghostForm.fullName}
                  onChange={handleGhostChange}
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={ghostForm.phone}
                  onChange={handleGhostChange}
                  required
                  placeholder="0901234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="identityCard">
                  Số CCCD <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="identityCard"
                  name="identityCard"
                  value={ghostForm.identityCard}
                  onChange={handleGhostChange}
                  required
                  placeholder="079..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Độ tuổi</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min="0"
                  value={ghostForm.age}
                  onChange={handleGhostChange}
                  placeholder="Ví dụ: 25"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={isAdding}>
                {isAdding ? 'Đang thêm...' : 'Thêm thành viên'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
