import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/axios-client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { TicketCategory, TicketPriority } from '@/features/tickets/api/types'
import { ticketApi } from '@/features/tickets/api/ticket.api'

interface CreateTenantTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTenantTicketDialog({ open, onOpenChange }: CreateTenantTicketDialogProps) {
  const queryClient = useQueryClient()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TicketCategory>('OTHER')
  const [priority] = useState<TicketPriority>('MEDIUM')
  const [selectedContractId, setSelectedContractId] = useState<string>('')

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Lấy danh sách hợp đồng của tôi để chọn phòng
  const { data: queryData, isLoading: isLoadingContracts } = useQuery({
    queryKey: ['account-self-service', '/contracts/me'],
    queryFn: () => apiClient.get('/contracts/me', { params: { page: 1, limit: 50 } }).then(res => res.data),
    enabled: open
  })
  
  // Lọc chỉ lấy các hợp đồng đang active
  const contractsData = Array.isArray(queryData?.data) ? queryData.data : (Array.isArray(queryData) ? queryData : [])
  const activeContracts = contractsData.filter((c: Record<string, unknown>) => c.status === 'ACTIVE' || c.status === 'EXPIRING_SOON')

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedContractId && activeContracts.length > 0) {
        throw new Error('Vui lòng chọn phòng (hợp đồng)')
      }
      
      let contract = activeContracts.find(c => String(c.id) === selectedContractId)
      // Nếu chỉ có 1 hợp đồng thì tự chọn luôn
      if (!contract && activeContracts.length === 1) {
        contract = activeContracts[0]
      }
      
      if (!contract) {
        throw new Error('Không xác định được phòng. Bạn cần có hợp đồng đang hiệu lực để gửi yêu cầu hỗ trợ.')
      }
      
      const newTicket = await ticketApi.createMyTicket({
        title,
        description,
        category,
        priority,
        roomId: contract.roomId,
        contractId: contract.id,
      })

      let uploadError = false
      if (selectedFiles.length > 0) {
        setIsUploading(true)
        try {
          // Upload từng file
          await Promise.all(selectedFiles.map(file => ticketApi.uploadAttachment(newTicket.id, file)))
        } catch (error) {
          console.error('Lỗi khi tải ảnh đính kèm', error)
          toast.error('Gửi yêu cầu thành công, nhưng tải ảnh lên bị lỗi.')
          uploadError = true
        } finally {
          setIsUploading(false)
        }
      }

      if (!uploadError) {
        toast.success('Gửi yêu cầu hỗ trợ thành công')
      }

      return newTicket
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-self-service', '/tickets/me'] })
      onOpenChange(false)
      // Reset form
      setTitle('')
      setDescription('')
      setCategory('OTHER')
      setSelectedContractId('')
      setSelectedFiles([])
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra khi gửi yêu cầu')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung')
      return
    }
    mutation.mutate()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      // Chỉ nhận ảnh
      const imageFiles = files.filter(f => f.type.startsWith('image/'))
      if (imageFiles.length !== files.length) {
        toast.error('Vui lòng chỉ tải lên file hình ảnh')
      }

      // Kiểm tra kích thước file (tối đa 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
      const validSizeFiles = imageFiles.filter(f => f.size <= MAX_FILE_SIZE)
      if (validSizeFiles.length !== imageFiles.length) {
        toast.error('Kích thước ảnh tối đa là 5MB')
      }

      setSelectedFiles(prev => [...prev, ...validSizeFiles].slice(0, 5)) // Giới hạn 5 ảnh
    }
  }

  // Pre-select if only 1 contract
  if (activeContracts.length === 1 && !selectedContractId) {
    setSelectedContractId(String(activeContracts[0].id))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo yêu cầu hỗ trợ mới</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="contract">Chọn phòng (Hợp đồng) <span className="text-red-500">*</span></Label>
            <Select 
              value={selectedContractId} 
              onValueChange={setSelectedContractId}
              disabled={isLoadingContracts || activeContracts.length <= 1}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingContracts ? "Đang tải..." : "Chọn phòng gặp sự cố"} />
              </SelectTrigger>
              <SelectContent>
                {activeContracts.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    Phòng {c.room?.name || c.roomCode} - HĐ: {c.contractCode || c.code}
                  </SelectItem>
                ))}
                {activeContracts.length === 0 && !isLoadingContracts && (
                  <SelectItem value="none" disabled>Không có hợp đồng nào đang hiệu lực</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Loại sự cố <span className="text-red-500">*</span></Label>
            <Select value={category} onValueChange={(val: string) => setCategory(val as TicketCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ELECTRICITY">Điện</SelectItem>
                <SelectItem value="WATER">Nước</SelectItem>
                <SelectItem value="INTERNET">Internet</SelectItem>
                <SelectItem value="FURNITURE">Nội thất / Vật dụng</SelectItem>
                <SelectItem value="SECURITY">An ninh</SelectItem>
                <SelectItem value="CLEANING">Vệ sinh</SelectItem>
                <SelectItem value="OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề <span className="text-red-500">*</span></Label>
            <Input 
              id="title" 
              placeholder="Vd: Máy lạnh phòng 101 bị rỉ nước" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết <span className="text-red-500">*</span></Label>
            <Textarea 
              id="description" 
              placeholder="Vui lòng mô tả rõ hơn về sự cố để kỹ thuật viên chuẩn bị dụng cụ..." 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Hình ảnh đính kèm (Tối đa 5 ảnh)</Label>
            <Input 
              type="file" 
              accept="image/jpeg,image/png,image/webp" 
              multiple 
              onChange={handleFileChange}
              disabled={selectedFiles.length >= 5}
            />
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="relative flex items-center justify-between rounded bg-slate-100 p-2 text-xs">
                    <span className="truncate w-32">{f.name}</span>
                    <button type="button" className="ml-2 text-red-500" onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}>Xóa</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={mutation.isPending || activeContracts.length === 0 || isUploading}>
              {mutation.isPending || isUploading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
