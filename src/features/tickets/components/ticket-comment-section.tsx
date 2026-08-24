import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { TicketComment } from '../api/types'
import { History, MessageCircle, Send, Lock, Globe, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TicketCommentSectionProps {
  comments: TicketComment[]
  onAddComment: (content: string, isInternal: boolean) => void
}

export function TicketCommentSection({ comments, onAddComment }: TicketCommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [activeTab, setActiveTab] = useState<'public' | 'internal'>('public')

  const handleSubmit = () => {
    if (!newComment.trim()) return
    onAddComment(newComment, activeTab === 'internal')
    setNewComment('')
  }

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
          <History className="h-5 w-5 text-blue-500" />
          Lịch sử hoạt động & Trao đổi
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-6">
          <div className="relative space-y-6 pl-8 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-0.5 before:bg-slate-100 before:content-['']">
            {(comments || []).map((comment) => (
              <div key={comment.id} className="relative">
                <div className="absolute top-0 -left-[39px] z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-500 shadow-sm">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{comment.user.fullName}</span>
                    <span className="text-sm text-slate-500">đã thêm bình luận</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 before:mr-1 before:content-['•']">
                      {new Date(comment.createdAt).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                    {comment.isInternal && (
                      <span className="ml-auto flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase">
                        <Lock className="h-3 w-3" /> Nội bộ
                      </span>
                    )}
                  </div>

                  <div
                    className={`mt-2 rounded-xl p-4 text-sm leading-relaxed shadow-sm ${
                      comment.isInternal
                        ? 'border border-amber-200/60 bg-amber-50/50 text-amber-900'
                        : 'border border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {comment.content}
                  </div>
                </div>
              </div>
            ))}

            {(comments || []).length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500 italic">
                Chưa có hoạt động hay trao đổi nào.
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="rounded-b-xl border-t border-slate-100 bg-slate-50 p-6">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'public' | 'internal')}
            className="w-full"
          >
            <TabsList className="mb-4 h-10 border border-slate-200 bg-white shadow-sm">
              <TabsTrigger
                value="public"
                className="gap-2 text-slate-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
              >
                <Globe className="h-4 w-4" /> Phản hồi khách thuê
              </TabsTrigger>
              <TabsTrigger
                value="internal"
                className="gap-2 text-slate-600 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-none"
              >
                <Lock className="h-4 w-4" /> Ghi chú nội bộ
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-4">
              <Avatar className="mt-1 hidden h-10 w-10 border border-slate-200 shadow-sm sm:block">
                <AvatarFallback className="bg-slate-200 text-slate-600">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="relative flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className={`min-h-[120px] w-full resize-none rounded-xl border p-4 pr-4 text-sm text-slate-900 shadow-sm transition-shadow placeholder:text-slate-400 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                    activeTab === 'internal'
                      ? 'border-amber-200 bg-amber-50/30 focus:border-amber-400 focus:ring-amber-200'
                      : 'border-slate-200 bg-white focus:border-blue-400 focus:ring-blue-200'
                  }`}
                  placeholder={
                    activeTab === 'internal'
                      ? 'Thêm ghi chú nội bộ (Chỉ nhân viên có thể xem)...'
                      : 'Nhập phản hồi cho khách thuê...'
                  }
                />
                <div className="mt-3 flex items-center justify-between">
                  <p className="flex items-center gap-1 text-xs text-slate-400">
                    {activeTab === 'internal' ? (
                      <>
                        <Lock className="h-3 w-3" /> Ghi chú này sẽ được ẩn với khách thuê
                      </>
                    ) : (
                      <>
                        <Globe className="h-3 w-3" /> Khách thuê sẽ nhận được thông báo
                      </>
                    )}
                  </p>
                  <Button
                    onClick={handleSubmit}
                    disabled={!newComment.trim()}
                    className={`shadow-sm ${activeTab === 'internal' ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Gửi {activeTab === 'internal' ? 'Ghi chú' : 'Phản hồi'}
                  </Button>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
