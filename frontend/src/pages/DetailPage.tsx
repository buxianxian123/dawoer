import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Media } from '../types'
import { fetchJson } from '../services/api'

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

  if (loading) return <div className="page">加载中...</div>
  if (!media) return <div className="page">未找到该作品。</div>

  const isExternalLink = media.type === 'LINK'

  return (
    <div className="page">
      <section className="section">
        <h1>{media.title}</h1>
        <p className="media-meta-line">
          {media.type && <span>类型：{media.type}　</span>}
          {media.region && <span>地域：{media.region}　</span>}
          {media.performers && <span>传承人：{media.performers}　</span>}
          {media.recordedAt && <span>采集日期：{media.recordedAt}</span>}
        </p>

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
            ) : (
              <a href={url} target="_blank" rel="noreferrer" className="btn">
                下载 / 打开文件
              </a>
            )}
          </div>
        )}

        {media.description && (
          <>
            <h2>作品简介</h2>
            <p>{media.description}</p>
          </>
        )}

        {media.scene && (
          <>
            <h2>民俗场景说明</h2>
            <p>{media.scene}</p>
          </>
        )}

        {media.lyrics && (
          <>
            <h2>歌词与译文</h2>
            <pre className="lyrics-block">{media.lyrics}</pre>
          </>
        )}

        {media.source && (
          <>
            <h2>资料来源</h2>
            <p>{media.source}</p>
          </>
        )}
      </section>
    </div>
  )
}

export default DetailPage

