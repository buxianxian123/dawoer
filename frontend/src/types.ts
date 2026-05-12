export type MediaType = 'VIDEO' | 'AUDIO' | 'IMAGE' | 'DOCUMENT' | 'LINK'

export interface Media {
  id: number
  title: string
  description?: string
  type: MediaType
  path: string
  duration?: number
  coverUrl?: string
  uploader?: string
  createdAt?: string
  scene?: string
  lyrics?: string
  region?: string
  performers?: string
  recordedAt?: string
  source?: string
}

export interface Category {
  id: number
  name: string
  parent?: Category | null
}

