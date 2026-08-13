import React, { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, UserPlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ContractMembersPage() {
  const { id } = useParams()
  const [loading, setLoading] = useState(false)

  // Dữ liệu mẫu
  const mockMembers = [
    { id: 101, name: 'Nguyễn Văn A', role: 'Đại diện thuê', phone: '0987654321', cccd: '001095001234' },
    { id: 103, name: 'Phạm Thị D', role: 'Thành viên', phone: '0933444555', cccd: '001095009876' }
  ]

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 800)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to={`/hop-dong/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Thành viên hợp đồng</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý những người ở cùng phòng thuộc hợp đồng HD-2026-08-001.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Danh sách thành viên hiện tại</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>SĐT</TableHead>
                      <TableHead>CCCD</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium text-slate-900">{member.name}</TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${member.role === 'Đại diện thuê' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                            {member.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{member.phone}</TableCell>
                        <TableCell className="text-sm text-slate-600">{member.cccd}</TableCell>
                        <TableCell>
                          {member.role !== 'Đại diện thuê' && (
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <form onSubmit={handleAddMember}>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Thêm thành viên</CardTitle>
                <CardDescription>
                  Chỉ định một người thuê có sẵn trong hệ thống vào hợp đồng này.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="renterSelect">Chọn người thuê</Label>
                  <Select required>
                    <SelectTrigger id="renterSelect">
                      <SelectValue placeholder="Tìm người thuê..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="105">Lê Văn E (0911223344)</SelectItem>
                      <SelectItem value="106">Hoàng Thị F (0988776655)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardContent className="border-t border-slate-100 pt-4">
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? 'Đang thêm...' : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Thêm vào hợp đồng
                    </>
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
