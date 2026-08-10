import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { TicketComment } from '../api/types'

interface TicketCommentSectionProps {
  comments: TicketComment[]
  onAddComment: (content: string, isInternal: boolean) => void
}

export function TicketCommentSection({ comments, onAddComment }: TicketCommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [isInternal, setIsInternal] = useState(true)

  const handleSubmit = () => {
    if (!newComment.trim()) return
    onAddComment(newComment, isInternal)
    setNewComment('')
  }

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
        <span className="material-symbols-outlined text-primary">history</span>
        Lịch sử hoạt động & Trao đổi
      </h2>

      <div className="relative pl-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-slate-200 before:content-['']">
        {comments.map((comment) => (
          <div key={comment.id} className="relative mb-6 last:mb-0">
            <div className="absolute top-1 -left-[30px] flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-sm">
              <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{comment.user.fullName}</span>
                <span className="text-sm text-slate-500">đã bình luận</span>
                {comment.isInternal && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600 uppercase">
                    Nội bộ
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString('vi-VN')}</span>
              <div
                className={`mt-2 rounded-lg p-3 text-sm ${comment.isInternal ? 'border border-amber-100 bg-amber-50 text-amber-900' : 'border border-slate-100 bg-slate-50 text-slate-700'}`}
              >
                {comment.content}
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && <div className="py-4 text-sm text-slate-500 italic">Chưa có hoạt động nào.</div>}
      </div>

      <div className="mt-4 flex gap-3">
        <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
          <span className="material-symbols-outlined text-[18px] text-white">person</span>
        </div>
        <div className="relative flex flex-1 flex-col gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="focus:ring-primary min-h-[80px] w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:outline-none"
            placeholder={isInternal ? 'Thêm ghi chú nội bộ (Khách thuê không thấy)...' : 'Phản hồi cho khách thuê...'}
          />
          <div className="mt-2 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="text-primary focus:ring-primary rounded"
              />
              Ghi chú nội bộ
            </label>
            <Button onClick={handleSubmit} disabled={!newComment.trim()} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">send</span>
              Gửi
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
