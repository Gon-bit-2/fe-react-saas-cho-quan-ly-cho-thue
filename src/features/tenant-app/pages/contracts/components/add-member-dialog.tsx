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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRentersControllerListForLandlord } from '@/shared/api/generated/renters/renters'
import { useAddContractMember } from '@/shared/api/contracts'
import { toast } from 'sonner'

// Simple useDebounce hook inline
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export function AddMemberDialog({
  contractId,
  children,
}: {
  contractId: number
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)

  const { data: rentersData, isLoading: isLoadingRenters } = useRentersControllerListForLandlord(
    { search: debouncedSearch, page: 1, limit: 10 },
    { query: { enabled: open } }
  )

  const { mutate: addMember, isPending: isAdding } = useAddContractMember(contractId)

  const handleAdd = (userId: number) => {
    addMember(userId, {
      onSuccess: () => {
        toast.success('Thêm thành viên thành công!')
        setOpen(false)
        setSearchTerm('')
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi thêm thành viên')
      },
    })
  }

  const renters = (rentersData as unknown as { data?: Array<{ id: number, fullName: string, email: string, phone?: string }> })?.data || []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm thành viên</DialogTitle>
          <DialogDescription>
            Tìm kiếm khách thuê theo tên, số điện thoại hoặc email để thêm vào hợp đồng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Tìm kiếm khách thuê..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="min-h-[200px] max-h-[300px] overflow-y-auto space-y-2 rounded-md border border-slate-100 p-2">
            {isLoadingRenters ? (
              <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : renters.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Không tìm thấy khách thuê nào phù hợp.
              </div>
            ) : (
              renters.map((renter) => (
                <div
                  key={renter.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage alt={renter.fullName} />
                      <AvatarFallback>
                        {renter.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">
                        {renter.fullName}
                      </span>
                      <span className="text-xs text-slate-500">
                        {renter.phone || renter.email || 'Chưa cập nhật TT'}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0 bg-blue-50 text-blue-600 hover:bg-blue-100"
                    onClick={() => handleAdd(renter.id)}
                    disabled={isAdding}
                  >
                    Thêm
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
