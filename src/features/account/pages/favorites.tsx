import { useFavorites } from '@/shared/api/marketplace'
import { RoomCard } from '@/features/marketplace/components/room-card'
import { Link } from 'react-router'

export function Component() {
  const { data: favorites, isLoading } = useFavorites()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-md text-text-main">Phòng yêu thích</h1>
        <p className="font-body-md text-on-surface-variant mt-1">Danh sách các phòng bạn đã lưu</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest border-surface-border rounded-xl border p-12 text-center shadow-sm">
          <div className="bg-surface-container mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <span className="material-symbols-outlined text-on-surface-variant text-3xl">favorite_border</span>
          </div>
          <h3 className="font-headline-sm text-text-main mt-4">Chưa có phòng yêu thích</h3>
          <p className="font-body-md text-on-surface-variant mt-2 mb-6">
            Bạn chưa lưu phòng nào. Hãy khám phá và lưu lại những phòng bạn quan tâm nhé!
          </p>
          <Link
            to="/phong"
            className="bg-primary text-on-primary font-label-md inline-flex items-center justify-center rounded-lg px-6 py-2.5 transition-opacity hover:opacity-90"
          >
            Khám phá ngay
          </Link>
        </div>
      )}
    </div>
  )
}
