import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../services/api';
import MediaCover from '../components/MediaCover';
const BrowsePage = () => {
    const [categoryGroups, setCategoryGroups] = useState({});
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [mediaPage, setMediaPage] = useState(null);
    const [loading, setLoading] = useState(false);
    const loadCategories = async () => {
        try {
            const data = await fetchJson('/api/categories');
            if (!data || data.length === 0) {
                setCategoryGroups({});
                return;
            }
            // 按父分类分组
            const groups = {};
            data.forEach(c => {
                if (c.parent && typeof c.parent === 'object') {
                    const parentName = c.parent.name;
                    if (!groups[parentName]) {
                        groups[parentName] = [];
                    }
                    groups[parentName].push(c);
                }
            });
            // 对每个组内的分类排序
            Object.keys(groups).forEach(key => {
                groups[key].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
            });
            setCategoryGroups(groups);
        }
        catch (e) {
            console.error(e);
        }
    };
    const loadMedia = async (page = 0) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('size', '12');
            if (keyword.trim())
                params.set('keyword', keyword.trim());
            selectedCategoryIds.forEach(id => params.append('categoryIds', String(id)));
            const data = await fetchJson(`/api/media?${params.toString()}`);
            setMediaPage(data);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadCategories();
    }, []);
    useEffect(() => {
        loadMedia(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategoryIds]);
    const handleSearch = (e) => {
        e.preventDefault();
        loadMedia(0);
    };
    const toggleCategory = (categoryId) => {
        setSelectedCategoryIds(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            }
            else {
                return [...prev, categoryId];
            }
        });
    };
    const clearFilters = () => {
        setSelectedCategoryIds([]);
        setKeyword('');
    };
    return (_jsxs("div", { className: "page two-column", children: [_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "sidebar-header", children: [_jsx("h2", { children: "\u7B5B\u9009\u6761\u4EF6" }), (selectedCategoryIds.length > 0 || keyword.trim()) && (_jsx("button", { onClick: clearFilters, className: "btn-clear-filters", children: "\u6E05\u9664" }))] }), _jsxs("div", { className: "search-filters", children: [_jsxs("form", { className: "search-bar-vertical", onSubmit: handleSearch, children: [_jsx("input", { type: "text", placeholder: "\u641C\u7D22\u6807\u9898\u3001\u5730\u57DF\u3001\u4F20\u627F\u4EBA\u7B49", value: keyword, onChange: (e) => setKeyword(e.target.value) }), _jsx("button", { type: "submit", className: "btn primary", style: { width: '100%' }, children: "\u641C\u7D22" })] }), Object.keys(categoryGroups).length > 0 && (_jsx("div", { className: "filter-groups", children: Object.entries(categoryGroups).map(([parentName, subCategories]) => (_jsxs("div", { className: "filter-group", children: [_jsx("div", { className: "filter-group-title", children: parentName }), _jsx("div", { className: "filter-group-items", children: subCategories.map((c) => (_jsxs("label", { className: `filter-chip ${selectedCategoryIds.includes(c.id) ? 'active' : ''}`, children: [_jsx("input", { type: "checkbox", checked: selectedCategoryIds.includes(c.id), onChange: () => toggleCategory(c.id) }), _jsx("span", { children: c.name })] }, c.id))) })] }, parentName))) }))] })] }), _jsxs("section", { className: "content", children: [_jsxs("div", { className: "section-header", children: [_jsx("h1", { children: "\u4F5C\u54C1\u6D4F\u89C8" }), (selectedCategoryIds.length > 0 || keyword.trim()) && (_jsxs("div", { className: "active-filters", children: [selectedCategoryIds.length > 0 && (_jsxs("span", { className: "filter-badge", children: ["\u5DF2\u9009 ", selectedCategoryIds.length, " \u4E2A\u5206\u7C7B"] })), keyword.trim() && (_jsxs("span", { className: "filter-badge", children: ["\u5173\u952E\u8BCD: ", keyword] }))] }))] }), loading ? (_jsx("div", { children: "\u52A0\u8F7D\u4E2D..." })) : !mediaPage || mediaPage.content.length === 0 ? (_jsx("div", { children: "\u6CA1\u6709\u627E\u5230\u7B26\u5408\u6761\u4EF6\u7684\u4F5C\u54C1\u3002" })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "media-grid", children: mediaPage.content.map((m) => (_jsxs(Link, { to: `/media/${m.id}`, className: "media-card", children: [_jsx(MediaCover, { media: m }), _jsxs("div", { className: "media-body", children: [_jsx("h3", { children: m.title }), m.region && _jsxs("p", { className: "media-meta", children: ["\u5730\u57DF\uFF1A", m.region] }), m.performers && _jsxs("p", { className: "media-meta", children: ["\u4F20\u627F\u4EBA\uFF1A", m.performers] })] })] }, m.id))) }), mediaPage.totalPages > 1 && (_jsx("div", { className: "pagination", children: Array.from({ length: mediaPage.totalPages }).map((_, idx) => (_jsx("button", { className: mediaPage.number === idx ? 'page-btn active' : 'page-btn', onClick: () => loadMedia(idx), children: idx + 1 }, idx))) }))] }))] })] }));
};
export default BrowsePage;
