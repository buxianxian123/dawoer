import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Media, Category } from '../types'
import { fetchJson } from '../services/api'
import MediaCover from '../components/MediaCover'

const typeLabels: Record<string, string> = {
  AUDIO: '音频',
  VIDEO: '视频',
  IMAGE: '图片',
  DOCUMENT: '文档',
  LINK: '外部链接',
}

const HomePage: React.FC = () => {
  const [latest, setLatest] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const page = await fetchJson<{ content: Media[] }>('/api/media?page=0&size=6')
        setLatest(page.content || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getGenreFromMedia = (m: Media): string | null => {
    const categories = (m as any).categories
    if (!categories || !Array.isArray(categories)) return null
    const genre = categories.find(
      (c: Category & { parent?: Category }) => c.parent && typeof c.parent === 'object' && c.parent.name === '按体裁类型'
    )
    return genre ? genre.name : null
  }

  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>达斡尔族传统音乐数字库</h1>
          <p>
            这里汇集达斡尔族的扎恩达勒、乌钦、鲁日格勒三大核心体裁的传统音乐，
            通过数字化方式保存与分类，方便研究者与公众按体裁类型、习俗场合、地域与传承人进行检索与聆听。
          </p>
          <div className="hero-actions">
            <Link to="/browse" className="btn primary">
              浏览作品
            </Link>
            <Link to="/upload" className="btn">
              录入新资料
            </Link>
          </div>
        </div>
      </section>

      <section className="home-intro-section">
        <div className="intro-cards">
          <div className="intro-card">
            <div className="intro-card-icon">🎵</div>
            <h3>扎恩达勒</h3>
            <p>山野民歌，广袤自然的声学回应。音域宽广、节奏自由、拖腔悠长。</p>
          </div>
          <div className="intro-card">
            <div className="intro-card-icon">📜</div>
            <h3>乌钦</h3>
            <p>叙事长诗，无文字民族的"声音史书"。语言牵引旋律，吟诵性强。</p>
          </div>
          <div className="intro-card">
            <div className="intro-card-icon">💃</div>
            <h3>鲁日格勒</h3>
            <p>民间歌舞，群体凝聚的仪式律动。一领众和、节奏律动强。</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>代表性作品</h2>
          <Link to="/browse" className="link-inline">
            查看全部 →
          </Link>
        </div>
        {loading ? (
          <div className="loading-state">加载中...</div>
        ) : latest.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>暂时还没有录入作品</p>
            <p className="empty-hint">前往"资料录入"页面上传第一条达斡尔族音乐资料</p>
            <Link to="/upload" className="btn primary" style={{ marginTop: '16px' }}>去录入</Link>
          </div>
        ) : (
          <div className="media-grid">
            {latest.map((m) => {
              const genre = getGenreFromMedia(m)
              return (
                <Link key={m.id} to={`/media/${m.id}`} className="media-card">
                  <MediaCover media={m} />
                  <div className="media-body">
                    <h3>{m.title}</h3>
                    <div className="media-tags-row">
                      <span className="media-type-tag">{typeLabels[m.type] || m.type}</span>
                      {genre && <span className="media-genre-tag">{genre}</span>}
                    </div>
                    {m.region && <p className="media-meta">📍 {m.region}</p>}
                    {m.performers && <p className="media-meta">🎤 {m.performers}</p>}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default HomePage
