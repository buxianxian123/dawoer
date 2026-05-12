import React, { useEffect, useState } from 'react'
import { Category, MediaType } from '../types'
import { fetchJson } from '../services/api'

const UploadPage: React.FC = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'AUDIO' as MediaType,
    categoryIds: [] as number[],
    tags: '' as string,
    scene: '',
    lyrics: '',
    region: '',
    performers: '',
    recordedAt: '',
    source: '',
    uploader: '',
    url: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [categoryGroups, setCategoryGroups] = useState<Record<string, Category[]>>({})

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
      console.error('获取分类失败:', e)
      setCategoryGroups({})
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleInitCategories = async () => {
    try {
      const response = await fetch('/api/categories/init', { method: 'POST' })
      const message = await response.text()
      alert(message)
      // 重新加载分类列表
      await loadCategories()
    } catch (e) {
      console.error(e)
      alert('初始化失败，请检查后端是否正常运行')
    }
  }

  const updateField = (key: keyof typeof form, value: string | MediaType) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleCategory = (id: number) => {
    setForm((prev) => {
      const exists = prev.categoryIds.includes(id)
      return {
        ...prev,
        categoryIds: exists ? prev.categoryIds.filter((x) => x !== id) : [...prev.categoryIds, id],
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      if (form.description) fd.append('description', form.description)
      fd.append('type', form.type)
      form.categoryIds.forEach((id) => fd.append('categoryIds', String(id)))
      if (form.tags.trim()) {
        form.tags
          .split(/[，,\s]+/)
          .filter(Boolean)
          .forEach((t) => fd.append('tags', t))
      }
      if (form.scene) fd.append('scene', form.scene)
      if (form.lyrics) fd.append('lyrics', form.lyrics)
      if (form.region) fd.append('region', form.region)
      if (form.performers) fd.append('performers', form.performers)
      if (form.recordedAt) fd.append('recordedAt', form.recordedAt)
      if (form.source) fd.append('source', form.source)
      if (form.uploader) fd.append('uploader', form.uploader)

      if (form.type === 'LINK') {
        fd.append('url', form.url)
      } else if (file) {
        fd.append('file', file)
      }

      // 如果有封面文件，也一起上传
      if (coverFile) {
        fd.append('coverFile', coverFile)
      }

      const res = await fetch('/api/media', {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const errorText = await res.text()
        if (res.status === 413 || errorText.includes('size') || errorText.includes('Size')) {
          throw new Error('文件太大，单个文件不能超过 500MB。如果文件较大，建议压缩后再上传。')
        }
        throw new Error(errorText || '上传失败，请稍后重试')
      }
      setMessage('上传成功，可以在“作品浏览”中查看。')
      setForm({
        title: '',
        description: '',
        type: 'AUDIO',
        categoryIds: [],
        tags: '',
        scene: '',
        lyrics: '',
        region: '',
        performers: '',
        recordedAt: '',
        source: '',
        uploader: '',
        url: '',
      })
      setFile(null)
      setCoverFile(null)
      setCoverPreview(null)
    } catch (err: any) {
      console.error(err)
      let errorMessage = '上传失败，请稍后重试。'
      if (err.message) {
        errorMessage = err.message
      } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        errorMessage = '网络连接失败，请检查后端服务是否正常运行，或文件是否过大导致连接中断。'
      }
      setMessage(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const isLink = form.type === 'LINK'

  // 处理文件选择：如果是视频，自动提取封面帧
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)

    // 如果是视频文件，自动提取第一帧作为封面预览
    if (selectedFile && form.type === 'VIDEO' && selectedFile.type.startsWith('video/')) {
      try {
        const videoUrl = URL.createObjectURL(selectedFile)
        const video = document.createElement('video')
        video.src = videoUrl
        video.currentTime = 1 // 跳到第1秒
        video.muted = true

        video.onloadeddata = () => {
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const frameUrl = canvas.toDataURL('image/jpeg', 0.8)
            setCoverPreview(frameUrl)
            // 将canvas转为File对象
            canvas.toBlob((blob) => {
              if (blob) {
                const coverFile = new File([blob], 'cover.jpg', { type: 'image/jpeg' })
                setCoverFile(coverFile)
              }
            }, 'image/jpeg', 0.8)
          }
          URL.revokeObjectURL(videoUrl)
        }
        video.onerror = () => {
          URL.revokeObjectURL(videoUrl)
        }
      } catch (err) {
        console.error('提取视频帧失败:', err)
      }
    } else if (selectedFile && form.type === 'IMAGE') {
      // 如果是图片，直接作为封面预览
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
        setCoverFile(selectedFile)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      // 其他类型清空封面
      setCoverPreview(null)
      setCoverFile(null)
    }
  }

  // 手动选择封面图
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setCoverFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  // 当媒体类型改变时，清空封面
  const handleTypeChange = (newType: MediaType) => {
    updateField('type', newType)
    setCoverPreview(null)
    setCoverFile(null)
    setFile(null)
  }

  return (
    <div className="page">
      <section className="section">
        <h1>资料录入</h1>
        <p className="section-intro">
          用于录入达斡尔族传统音乐的音频 / 视频 / 文献资料。
          你可以尽可能填写民俗场景、歌词、地域、传承人等信息，后续可以直接在论文中引用。
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>标题 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label>简介</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-row">
            <label>媒体类型 *</label>
            <select value={form.type} onChange={(e) => handleTypeChange(e.target.value as MediaType)}>
              <option value="AUDIO">音频</option>
              <option value="VIDEO">视频</option>
              <option value="IMAGE">图片</option>
              <option value="DOCUMENT">文档</option>
              <option value="LINK">外部链接</option>
            </select>
          </div>

          <div className="form-row">
            <label>
              所属分类
              {Object.keys(categoryGroups).length === 0 && (
                <button
                  type="button"
                  onClick={handleInitCategories}
                  className="btn-init-categories"
                  style={{ marginLeft: '12px', fontSize: '13px', padding: '4px 12px' }}
                >
                  初始化分类
                </button>
              )}
            </label>
            {Object.keys(categoryGroups).length === 0 ? (
              <div className="form-hint">
                暂无分类。点击上方"初始化分类"按钮自动创建分类体系，或重启后端应用（会自动初始化）。
              </div>
            ) : (
              <div className="category-groups">
                {Object.entries(categoryGroups).map(([parentName, subCategories]) => (
                  <div key={parentName} className="category-group">
                    <div className="category-group-title">{parentName}</div>
                    <div className="category-group-items">
                      {subCategories.map((c) => (
                        <label key={c.id} className="category-chip">
                          <input
                            type="checkbox"
                            checked={form.categoryIds.includes(c.id)}
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

          <div className="form-row">
            <label>标签（用逗号或空格分隔）</label>
            <input
              type="text"
              placeholder="如：德莫日根 木库连 女声独唱 梅里斯"
              value={form.tags}
              onChange={(e) => updateField('tags', e.target.value)}
            />
          </div>

          {!isLink && (
            <>
              <div className="form-row">
                <label>上传文件 *</label>
                <input
                  type="file"
                  accept={form.type === 'VIDEO' ? 'video/*' : form.type === 'AUDIO' ? 'audio/*' : form.type === 'IMAGE' ? 'image/*' : '*'}
                  onChange={handleFileChange}
                />
                {file && (
                  <div className="file-info">
                    已选择：{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>

              {(form.type === 'VIDEO' || form.type === 'IMAGE') && (
                <div className="form-row">
                  <label>封面图 {form.type === 'VIDEO' && '(视频会自动提取第1秒画面，也可手动上传)'}</label>
                  {coverPreview && (
                    <div className="cover-preview">
                      <img src={coverPreview} alt="封面预览" />
                      <button
                        type="button"
                        className="btn-remove-cover"
                        onClick={() => {
                          setCoverPreview(null)
                          setCoverFile(null)
                        }}
                      >
                        移除封面
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    style={{ marginTop: coverPreview ? '12px' : '0' }}
                  />
                </div>
              )}
            </>
          )}

          {isLink && (
            <div className="form-row">
              <label>外部链接 URL *</label>
              <input
                type="url"
                placeholder="如：B站 / 抖音 / 文献数据库链接"
                value={form.url}
                onChange={(e) => updateField('url', e.target.value)}
              />
            </div>
          )}

          <div className="form-row">
            <label>民俗场景说明</label>
            <textarea
              value={form.scene}
              onChange={(e) => updateField('scene', e.target.value)}
              rows={3}
              placeholder="如：婚礼迎亲环节新娘入门前，由女性亲属围坐在炕沿演唱……"
            />
          </div>

          <div className="form-row">
            <label>歌词与译文</label>
            <textarea
              value={form.lyrics}
              onChange={(e) => updateField('lyrics', e.target.value)}
              rows={4}
              placeholder="可以写：达斡尔语原文 + 汉语大意。"
            />
          </div>

          <div className="form-row two-col">
            <div>
              <label>地域</label>
              <input
                type="text"
                placeholder="如：黑龙江省齐齐哈尔市梅里斯达斡尔族区"
                value={form.region}
                onChange={(e) => updateField('region', e.target.value)}
              />
            </div>
            <div>
              <label>传承人 / 演唱者</label>
              <input
                type="text"
                placeholder="如：某某巴图（男，68 岁）"
                value={form.performers}
                onChange={(e) => updateField('performers', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row two-col">
            <div>
              <label>采集日期</label>
              <input
                type="date"
                value={form.recordedAt}
                onChange={(e) => updateField('recordedAt', e.target.value)}
              />
            </div>
            <div>
              <label>资料来源</label>
              <input
                type="text"
                placeholder="如：2024 年暑期田野自录 / 某档案馆 / 某视频网站"
                value={form.source}
                onChange={(e) => updateField('source', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <label>录入者</label>
            <input
              type="text"
              placeholder="可以写自己的名字，便于后续管理"
              value={form.uploader}
              onChange={(e) => updateField('uploader', e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? '上传中...' : '提交'}
            </button>
            {message && (
              <span className={`form-message ${message.includes('成功') ? 'success' : 'error'}`}>
                {message}
              </span>
            )}
          </div>
        </form>
      </section>
    </div>
  )
}

export default UploadPage

