import React from 'react'
import { Routes, Route, Link, NavLink } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BrowsePage from './pages/BrowsePage'
import UploadPage from './pages/UploadPage'
import DetailPage from './pages/DetailPage'

const App: React.FC = () => {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="logo-text">
            达斡尔族传统音乐数字库
          </Link>
          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              首页
            </NavLink>
            <NavLink to="/browse" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              作品浏览
            </NavLink>
            <NavLink to="/upload" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              资料录入
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/media/:id" element={<DetailPage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <span>达斡尔族传统音乐数字化资源库 · 采集-入库-转化-审核-传播-验证</span>
        <br />
        <span>基于 Spring Boot + PostgreSQL + MinIO 构建 · 学术研究项目</span>
      </footer>
    </div>
  )
}

export default App

