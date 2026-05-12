import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Category, Media } from '../types'
import { fetchJson } from '../services/api'
import MediaCover from '../components/MediaCover'

const typeLabels: Record<string, string> = {
  AUDIO: '音频',
  VIDEO: '视频',
  IMAGE: '图片',
  DOCUMENT: '文档',
  LINK: '外部链接',
}

const BrowsePage: React.FC = () => {
  const [categoryGroups, setCategoryGroups] = useState<Record<string, Category[]>>({})
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [keyword, setKeyword] = useState('')
  const [mediaPage, setMediaPage] = useState<{ content: Media[]; totalPages: number; number: number } | null>(null)
  const [loading, setLoading] = useState(false)

  const loadCategories = async () => {
    try {
      const data = await fetchJson<Category[]>('/api/categories')
      
      if (!data || data.length === 0) {
        setCategoryGroups({})
        return
      }

      const groups: Record<string, Category[]> = {}
      data.forEach(c => {
        if (c.parent && typeof c.parent === 'object') {
          const parentName = c.parent.name
          if (!groups[parentName]) {
            groups[parentName] = []
          }
          groups[parentName].push(c)
        }
      })

      Object.keys(groups).forEach(key => {
        groups[key].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
      })

      setCategoryGroups(groups)
    } catch (e) {
      console.error(e)
    }
  }

  const loadMedia = async (page = 0) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('size', '12')
      if (keyword.trim()) params.set('keyword', keyword.trim())
      selectedCategoryIds.forEach(id => params.append('categoryIds', String(id)))
      const data = await fetchJson<{ content: Media[]; totalPages: number; number: number }>(`/api/media?${params.toString()}`)
      setMediaPage(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadMedia(0)
  }, [selectedCategoryIds])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadMedia(0)
  }

  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const clearFilters = () => {
    setSelectedCategoryIds([])
    setKeyword('')
  }

  const getGenreFromMedia = (m: Media): string | null => {
    const categories = (m as any).categories
    if (!categories || !Array.isArray(categories)) return null
    const genre = categories.find(
      (c: Category & { parent?: Category }) => c.parent && typeof c.parent === 'object' && c.parent.name === '按体裁类型'
    )
    return genre ? genre.name : null
  }

  return (
    <div className="page two-column">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>筛选条件</h2>
          {(selectedCategoryIds.length > 0 || keyword.trim()) && (
            <button onClick={clearFilters} className="btn-clear-filters">
              清除
            </button>
          )}
        </div>

        <div className="search-filters">
          <form className="search-bar-vertical" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="搜索标题、地域、传承人等"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="btn primary" style={{ width: '100%' }}>
              搜索
            </button>
          </form>

          {Object.keys(categoryGroups).length > 0 && (
            <div className="filter-groups">
              {Object.entries(categoryGroups).map(([parentName, subCategories]) => (
                <div key={parentName} className="filter-group">
                  <div className="filter-group-title">{parentName}</div>
                  <div className="filter-group-items">
                    {subCategories.map((c) => (
                      <label
                        key={c.id}
                        className={`filter-chip ${selectedCategoryIds.includes(c.id) ? 'active' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.includes(c.id)}
                          onChange={() => toggleCategory(c.id)}
                        />
                        <span>{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      <section className="content">
        <div className="section-header">
          <h1>作品浏览</h1>
          {(selectedCategoryIds.length > 0 || keyword.trim()) && (
            <div className="active-filters">
              {selectedCategoryIds.length > 0 && (
                <span className="filter-badge">
                  已选 {selectedCategoryIds.length} 个分类
                </span>
              )}
              {keyword.trim() && (
                <span className="filter-badge">
                  关键词: {keyword}
                </span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state">加载中...</div>
        ) : !mediaPage || mediaPage.content.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>没有找到符合条件的作品</p>
            <p className="empty-hint">尝试调整筛选条件，或前往"资料录入"添加新内容</p>
          </div>
        ) : (
          <>
            <div className="media-grid">
              {mediaPage.content.map((m) => {
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
            {mediaPage.totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: mediaPage.totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    className={mediaPage.number === idx ? 'page-btn active' : 'page-btn'}
                    onClick={() => loadMedia(idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default BrowsePage
