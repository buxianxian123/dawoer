import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Category, Media } from '../types'
import { fetchJson } from '../services/api'
import MediaCover from '../components/MediaCover'

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

      // 按父分类分组
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

      // 对每个组内的分类排序
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <div>加载中...</div>
        ) : !mediaPage || mediaPage.content.length === 0 ? (
          <div>没有找到符合条件的作品。</div>
        ) : (
          <>
            <div className="media-grid">
              {mediaPage.content.map((m) => (
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
