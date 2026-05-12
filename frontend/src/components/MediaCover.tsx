import React, { useEffect, useState } from 'react'
import { Media } from '../types'
import { fetchJson } from '../services/api'

interface MediaCoverProps {
  media: Media
}

const MediaCover: React.FC<MediaCoverProps> = ({ media }) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(media.coverUrl || null)

  useEffect(() => {
    // 如果coverUrl存在但不是完整URL（是MinIO对象名），则获取临时链接
    if (media.coverUrl && !media.coverUrl.startsWith('http')) {
      fetchJson<string>(`/api/media/${media.id}/cover`)
        .then(setCoverUrl)
        .catch(() => {
          // 如果获取失败，保持为null，显示占位符
          setCoverUrl(null)
        })
    }
  }, [media.id, media.coverUrl])

  return (
    <div className="media-cover">
      {coverUrl ? (
        <img src={coverUrl} alt={media.title} className="media-cover-image" />
      ) : (
        <div className="media-cover-placeholder">
          {media.type === 'AUDIO' && <span className="media-icon">🎵</span>}
          {media.type === 'VIDEO' && <span className="media-icon">🎬</span>}
          {media.type === 'IMAGE' && <span className="media-icon">🖼️</span>}
          {media.type === 'DOCUMENT' && <span className="media-icon">📄</span>}
          {media.type === 'LINK' && <span className="media-icon">🔗</span>}
        </div>
      )}
      <span className="media-type">
        {media.type === 'AUDIO' ? '音频' : media.type === 'VIDEO' ? '视频' : media.type === 'IMAGE' ? '图片' : media.type === 'DOCUMENT' ? '文档' : '链接'}
      </span>
    </div>
  )
}

export default MediaCover
