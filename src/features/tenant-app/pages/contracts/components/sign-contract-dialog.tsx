import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SignaturePad } from '@/shared/components/signature-pad'

interface SignContractDialogProps {
  children: React.ReactNode
  onSign: (signature: string) => void
  isPending?: boolean
  title?: string
}

export function SignContractDialog({ children, onSign, isPending, title = 'Ký hợp đồng' }: SignContractDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSave = (signature: string) => {
    onSign(signature)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <SignaturePad
          title="Vui lòng ký vào khung bên dưới"
          onSave={handleSave}
          onCancel={() => setOpen(false)}
        />
        {isPending && <div className="text-center mt-2 text-sm text-slate-500">Đang lưu chữ ký...</div>}
      </DialogContent>
    </Dialog>
  )
}
