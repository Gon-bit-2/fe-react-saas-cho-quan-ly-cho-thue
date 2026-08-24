import { useAuth } from '@/shared/hooks/use-auth'
import { useAddFavorite, useRemoveFavorite, useFavorites, marketplaceKeys } from '@/shared/api/marketplace'
import { useQueryClient } from '@tanstack/react-query'

interface FavoriteButtonProps {
  roomId: number
  className?: string
  withText?: boolean
}

export function FavoriteButton({ roomId, className = '', withText = false }: FavoriteButtonProps) {
  const { state } = useAuth()
  const isAuthenticated = state === 'authenticated'
  const queryClient = useQueryClient()

  const { data: favorites } = useFavorites()
  const addMutation = useAddFavorite()
  const removeMutation = useRemoveFavorite()

  const isFavorited = favorites?.some((fav) => fav.id === roomId) || false

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để lưu phòng yêu thích')
      return
    }

    if (isFavorited) {
      const previousFavorites = queryClient.getQueryData(marketplaceKeys.favorites())
      queryClient.setQueryData(marketplaceKeys.favorites(), (old: Array<{ id: number }> | undefined) =>
        old ? old.filter((room) => room.id !== roomId) : [],
      )
      removeMutation.mutate(roomId, {
        onError: () => {
          queryClient.setQueryData(marketplaceKeys.favorites(), previousFavorites)
        },
      })
    } else {
      addMutation.mutate(roomId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: marketplaceKeys.favorites() })
        },
      })
    }
  }

  if (withText) {
    return (
      <button
        onClick={toggleFavorite}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2.5 transition-colors border font-label-md ${
          isFavorited 
            ? 'bg-primary-container text-primary border-primary-container hover:bg-primary-container/80' 
            : 'bg-surface-container-lowest text-on-surface border-surface-border hover:bg-surface-container-high'
        } ${className}`}
      >
        <span className={`material-symbols-outlined ${isFavorited ? 'text-primary' : 'text-on-surface-variant'} text-[18px]`}>
          {isFavorited ? 'bookmark' : 'bookmark_border'}
        </span>
        {isFavorited ? 'Đã lưu' : 'Lưu phòng'}
      </button>
    )
  }

  return (
    <button
      onClick={toggleFavorite}
      className={`z-30 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isFavorited ? 'bg-primary-container text-primary' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} ${className}`}
      aria-label={isFavorited ? 'Bỏ yêu thích' : 'Yêu thích'}
    >
      <span className="material-symbols-outlined text-[16px]">{isFavorited ? 'bookmark' : 'bookmark_border'}</span>
    </button>
  )
}
