import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { profileApi } from '../api/profile.api';
import type { UserProfile } from '../api/types';

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await profileApi.getProfile();
        setProfile(data);
        setFormData(prev => ({
          ...prev,
          fullName: data.fullName,
          phone: data.phone || ''
        }));
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      await profileApi.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone
      });
      // Optionally show success toast
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8">Đang tải hồ sơ...</div>;
  if (!profile) return <div className="p-8 text-red-500">Không tìm thấy thông tin.</div>;

  return (
    <div className="flex flex-col w-full h-full p-8 bg-background min-h-[calc(100vh-64px)] max-w-[1000px] mx-auto gap-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Hồ sơ tài khoản</h1>
        <p className="text-sm text-slate-500">Quản lý thông tin cá nhân và bảo mật.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar avatar */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold mb-4 relative group cursor-pointer overflow-hidden">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.fullName.substring(0, 2).toUpperCase()
              )}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white">photo_camera</span>
                <span className="text-xs text-white mt-1">Đổi ảnh</span>
              </div>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{profile.fullName}</h3>
            <p className="text-sm text-slate-500">{profile.email}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Tài khoản {profile.status === 'ACTIVE' ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
            </div>
          </div>
        </div>

        {/* Main forms */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Thông tin cá nhân</h2>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled className="bg-slate-50 text-slate-500" />
                <p className="text-xs text-slate-400">Không thể thay đổi địa chỉ email.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button onClick={handleUpdateProfile} disabled={isSaving}>
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Bảo mật</h2>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input id="currentPassword" type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input id="newPassword" type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input id="confirmPassword" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button variant="secondary" disabled={!formData.currentPassword || !formData.newPassword}>
                  Đổi mật khẩu
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
