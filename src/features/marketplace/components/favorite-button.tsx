import { useAuth } from '@/shared/hooks/use-auth'
import { useAddFavorite, useRemoveFavorite, useFavorites, marketplaceKeys } from '@/shared/api/marketplace'
import { useQueryClient } from '@tanstack/react-query'

interface FavoriteButtonProps {
  roomId: number
  className?: string
}

export function FavoriteButton({ roomId, className = '' }: FavoriteButtonProps) {
  const { state } = useAuth()
  const isAuthenticated = state === 'authenticated'
  const queryClient = useQueryClient()
  
  const { data: favorites } = useFavorites()
  const addMutation = useAddFavorite()
  const removeMutation = useRemoveFavorite()

  const isFavorited = favorites?.some(fav => fav.id === roomId) || false

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để lưu phòng yêu thích')
      return
    }

    if (isFavorited) {
      const previousFavorites = queryClient.getQueryData(marketplaceKeys.favorites())
      queryClient.setQueryData(marketplaceKeys.favorites(), (old: any) => 
        old ? old.filter((room: any) => room.id !== roomId) : []
      )
      removeMutation.mutate(roomId, {
        onError: () => {
          queryClient.setQueryData(marketplaceKeys.favorites(), previousFavorites)
        }
      })
    } else {
      addMutation.mutate(roomId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: marketplaceKeys.favorites() })
        }
      })
    }
  }

  return (
    <button 
      onClick={toggleFavorite}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors z-30 ${isFavorited ? 'bg-primary-container text-primary' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} ${className}`}
      aria-label={isFavorited ? "Bỏ yêu thích" : "Yêu thích"}
    >
      <span className="material-symbols-outlined text-[16px]">
        {isFavorited ? 'bookmark' : 'bookmark_border'}
      </span>
    </button>
  )
}
