import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Media, Category } from '../types'
import { fetchJson } from '../services/api'

const typeLabels: Record<string, string> = {
  AUDIO: '音频',
  VIDEO: '视频',
  IMAGE: '图片',
  DOCUMENT: '文档',
  LINK: '外部链接',
}

const typeIcons: Record<string, string> = {
  AUDIO: '🎵',
  VIDEO: '🎬',
  IMAGE: '🖼️',
  DOCUMENT: '📄',
  LINK: '🔗',
}

const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [media, setMedia] = useState<Media | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        const data = await fetchJson<Media>(`/api/media/${id}`)
        setMedia(data)
        const u = await fetchJson<string>(`/api/media/${id}/url`)
        setUrl(u)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <div className="page"><div className="loading-state">加载中...</div></div>
  if (!media) return <div className="page"><div className="empty-state">未找到该作品。</div></div>

  const isExternalLink = media.type === 'LINK'

  const genreCategories = (media as any).categories?.filter(
    (c: Category & { parent?: Category }) => c.parent && typeof c.parent === 'object' && c.parent.name === '按体裁类型'
  ) || []

  const otherCategories = (media as any).categories?.filter(
    (c: Category & { parent?: Category }) => c.parent && typeof c.parent === 'object' && c.parent.name !== '按体裁类型'
  ) || []

  return (
    <div className="page">
      <section className="section detail-section">
        <Link to="/browse" className="back-link">← 返回浏览</Link>

        <div className="detail-header">
          <h1>{media.title}</h1>
          <div className="detail-meta-row">
            <span className="detail-type-badge">
              {typeIcons[media.type]} {typeLabels[media.type] || media.type}
            </span>
            {genreCategories.map((c: Category) => (
              <span key={c.id} className="detail-genre-badge">{c.name}</span>
            ))}
          </div>
          <div className="detail-meta-line">
            {media.region && <span>📍 {media.region}　</span>}
            {media.performers && <span>🎤 {media.performers}　</span>}
            {media.recordedAt && <span>📅 {media.recordedAt}</span>}
          </div>
        </div>

        {url && (
          <div className="player-wrapper">
            {isExternalLink ? (
              <a href={url} target="_blank" rel="noreferrer" className="btn primary">
                前往外部链接播放 / 查看
              </a>
            ) : media.type === 'AUDIO' ? (
              <audio controls src={url}>
                您的浏览器不支持 audio 播放。
              </audio>
            ) : media.type === 'VIDEO' ? (
              <video controls src={url} />
            ) : media.type === 'IMAGE' ? (
              <img src={url} alt={media.title} />
            ) : media.type === 'DOCUMENT' ? (
              <div className="document-preview">
                <span className="document-icon">📄</span>
                <p>该资源为文档文件</p>
                <a href={url} target="_blank" rel="noreferrer" className="btn primary">
                  下载 / 打开文档
                </a>
              </div>
            ) : (
              <a href={url} target="_blank" rel="noreferrer" className="btn">
                下载 / 打开文件
              </a>
            )}
          </div>
        )}

        <div className="detail-info-grid">
          {media.description && (
            <div className="detail-info-block">
              <h2>作品简介</h2>
              <p>{media.description}</p>
            </div>
          )}

          {media.scene && (
            <div className="detail-info-block">
              <h2>民俗场景说明</h2>
              <p>{media.scene}</p>
            </div>
          )}

          {media.lyrics && (
            <div className="detail-info-block">
              <h2>歌词与译文</h2>
              <pre className="lyrics-block">{media.lyrics}</pre>
            </div>
          )}

          {otherCategories.length > 0 && (
            <div className="detail-info-block">
              <h2>所属分类</h2>
              <div className="detail-category-tags">
                {otherCategories.map((c: Category & { parent?: Category }) => (
                  <span key={c.id} className="detail-category-tag">
                    {c.parent?.name}: {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(media as any).tags && (media as any).tags.length > 0 && (
            <div className="detail-info-block">
              <h2>标签</h2>
              <div className="detail-tag-list">
                {(media as any).tags.map((t: { id: number; name: string }) => (
                  <span key={t.id} className="detail-tag">{t.name}</span>
                ))}
              </div>
            </div>
          )}

          {media.source && (
            <div className="detail-info-block">
              <h2>资料来源</h2>
              <p>{media.source}</p>
            </div>
          )}

          {media.uploader && (
            <div className="detail-info-block">
              <h2>录入者</h2>
              <p>{media.uploader}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default DetailPage
