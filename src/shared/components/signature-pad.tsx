import React, { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

interface SignaturePadProps {
  onSave: (signature: string) => void
  onCancel: () => void
  title?: string
}

export function SignaturePad({ onSave, onCancel, title = 'Ký xác nhận' }: SignaturePadProps) {
  const padRef = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  const handleClear = () => {
    padRef.current?.clear()
    setIsEmpty(true)
  }

  const handleSave = () => {
    if (padRef.current?.isEmpty()) {
      alert('Vui lòng ký trước khi lưu')
      return
    }
    const dataURL = padRef.current?.getCanvas().toDataURL('image/png')
    if (dataURL) {
      onSave(dataURL)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-headline-sm text-text-main">{title}</h3>
      <div className="border-surface-border overflow-hidden rounded-lg border bg-white">
        <SignatureCanvas
          ref={padRef}
          penColor="black"
          canvasProps={{
            className: 'w-full h-[200px] cursor-crosshair',
          }}
          onEnd={() => setIsEmpty(false)}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleClear}
          className="text-error font-label-md hover:bg-error/10 rounded-lg px-4 py-2 transition-colors"
        >
          Xóa làm lại
        </button>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="border-surface-border bg-surface hover:bg-surface-container font-label-md rounded-lg border px-4 py-2 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isEmpty}
            className="bg-primary text-on-primary hover:bg-primary-container font-label-md rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Lưu chữ ký
          </button>
        </div>
      </div>
    </div>
  )
}
