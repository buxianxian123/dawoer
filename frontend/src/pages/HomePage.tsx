import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Media } from '../types'
import { fetchJson } from '../services/api'
import MediaCover from '../components/MediaCover'

const HomePage: React.FC = () => {
  const [latest, setLatest] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        // 取最新的几条媒体作为“代表性作品”
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

  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>达斡尔族传统音乐数字库</h1>
          <p>
            这里汇集达斡尔族的叙事民歌、仪式音乐与器乐演奏，通过数字化方式保存与分类，
            方便研究者与公众按习俗场合、曲种类型、地域与传承人进行检索与聆听。
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

      <section className="section">
        <div className="section-header">
          <h2>代表性作品</h2>
          <Link to="/browse" className="link-inline">
            查看全部
          </Link>
        </div>
        {loading ? (
          <div>加载中...</div>
        ) : latest.length === 0 ? (
          <div>暂时还没有录入作品，可以先前往“资料录入”页面上传几条示例。</div>
        ) : (
          <div className="media-grid">
            {latest.map((m) => (
              <Link key={m.id} to={`/media/${m.id}`} className="media-card">
                <MediaCover media={m} />
                <div className="media-body">
                  <h3>{m.title}</h3>
                  {m.region && <p className="media-meta">地域：{m.region}</p>}
                  {m.performers && <p className="media-meta">传承人：{m.performers}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default HomePage

