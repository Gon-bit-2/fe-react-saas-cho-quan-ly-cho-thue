import { useMutation } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '@/shared/hooks/use-auth'
import type { OcrControllerGetById200 } from './generated/models'

export const useUploadOcr = () => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useMutation({
    mutationFn: async ({ meterId, file }: { meterId: number; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('meterId', String(meterId))

      const { data } = await apiClient.post<OcrControllerGetById200>(`/ocr/jobs`, formData, {
        tenantId,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
  })
}
