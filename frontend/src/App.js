import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import UploadPage from './pages/UploadPage';
import DetailPage from './pages/DetailPage';
const App = () => {
    return (_jsxs("div", { className: "app-root", children: [_jsx("header", { className: "app-header", children: _jsxs("div", { className: "app-header-inner", children: [_jsx(Link, { to: "/", className: "logo-text", children: "\u8FBE\u65A1\u5C14\u65CF\u4F20\u7EDF\u97F3\u4E50\u6570\u5B57\u5E93" }), _jsxs("nav", { className: "nav", children: [_jsx(NavLink, { to: "/", end: true, className: ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link'), children: "\u9996\u9875" }), _jsx(NavLink, { to: "/browse", className: ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link'), children: "\u4F5C\u54C1\u6D4F\u89C8" }), _jsx(NavLink, { to: "/upload", className: ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link'), children: "\u8D44\u6599\u5F55\u5165" })] })] }) }), _jsx("main", { className: "app-main", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/browse", element: _jsx(BrowsePage, {}) }), _jsx(Route, { path: "/upload", element: _jsx(UploadPage, {}) }), _jsx(Route, { path: "/media/:id", element: _jsx(DetailPage, {}) })] }) }), _jsx("footer", { className: "app-footer", children: _jsx("span", { children: "\u8FBE\u65A1\u5C14\u65CF\u4F20\u7EDF\u97F3\u4E50\u6570\u5B57\u5316\u4E0E\u4F20\u64AD\u5B9E\u8DF5 \u00B7 \u5B66\u672F\u7814\u7A76\u9879\u76EE\u6F14\u793A\u7AD9\u70B9" }) })] }));
};
export default App;
