import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TicketComment } from '../api/types';

interface TicketCommentSectionProps {
  comments: TicketComment[];
  onAddComment: (content: string, isInternal: boolean) => void;
}

export function TicketCommentSection({ comments, onAddComment }: TicketCommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(true);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment, isInternal);
    setNewComment('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-6 border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">history</span>
        Lịch sử hoạt động & Trao đổi
      </h2>

      <div className="relative pl-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
        {comments.map((comment) => (
          <div key={comment.id} className="relative mb-6 last:mb-0">
            <div className="absolute -left-[30px] top-1 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-900 font-semibold">{comment.user.fullName}</span>
                <span className="text-sm text-slate-500">đã bình luận</span>
                {comment.isInternal && (
                  <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    Nội bộ
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">
                {new Date(comment.createdAt).toLocaleString('vi-VN')}
              </span>
              <div className={`mt-2 p-3 rounded-lg text-sm ${comment.isInternal ? 'bg-amber-50 text-amber-900 border border-amber-100' : 'bg-slate-50 text-slate-700 border border-slate-100'}`}>
                {comment.content}
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-sm text-slate-500 italic py-4">Chưa có hoạt động nào.</div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-white text-[18px]">person</span>
        </div>
        <div className="flex-1 flex flex-col gap-2 relative">
          <textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 text-sm p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-none placeholder:text-slate-400" 
            placeholder={isInternal ? "Thêm ghi chú nội bộ (Khách thuê không thấy)..." : "Phản hồi cho khách thuê..."}
          />
          <div className="flex justify-between items-center mt-2">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
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
  );
}
