import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../services/api';
import MediaCover from '../components/MediaCover';
const HomePage = () => {
    const [latest, setLatest] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const load = async () => {
            try {
                // 取最新的几条媒体作为“代表性作品”
                const page = await fetchJson('/api/media?page=0&size=6');
                setLatest(page.content || []);
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, []);
    return (_jsxs("div", { className: "page", children: [_jsx("section", { className: "hero", children: _jsxs("div", { children: [_jsx("h1", { children: "\u8FBE\u65A1\u5C14\u65CF\u4F20\u7EDF\u97F3\u4E50\u6570\u5B57\u5E93" }), _jsx("p", { children: "\u8FD9\u91CC\u6C47\u96C6\u8FBE\u65A1\u5C14\u65CF\u7684\u53D9\u4E8B\u6C11\u6B4C\u3001\u4EEA\u5F0F\u97F3\u4E50\u4E0E\u5668\u4E50\u6F14\u594F\uFF0C\u901A\u8FC7\u6570\u5B57\u5316\u65B9\u5F0F\u4FDD\u5B58\u4E0E\u5206\u7C7B\uFF0C \u65B9\u4FBF\u7814\u7A76\u8005\u4E0E\u516C\u4F17\u6309\u4E60\u4FD7\u573A\u5408\u3001\u66F2\u79CD\u7C7B\u578B\u3001\u5730\u57DF\u4E0E\u4F20\u627F\u4EBA\u8FDB\u884C\u68C0\u7D22\u4E0E\u8046\u542C\u3002" }), _jsxs("div", { className: "hero-actions", children: [_jsx(Link, { to: "/browse", className: "btn primary", children: "\u6D4F\u89C8\u4F5C\u54C1" }), _jsx(Link, { to: "/upload", className: "btn", children: "\u5F55\u5165\u65B0\u8D44\u6599" })] })] }) }), _jsxs("section", { className: "section", children: [_jsxs("div", { className: "section-header", children: [_jsx("h2", { children: "\u4EE3\u8868\u6027\u4F5C\u54C1" }), _jsx(Link, { to: "/browse", className: "link-inline", children: "\u67E5\u770B\u5168\u90E8" })] }), loading ? (_jsx("div", { children: "\u52A0\u8F7D\u4E2D..." })) : latest.length === 0 ? (_jsx("div", { children: "\u6682\u65F6\u8FD8\u6CA1\u6709\u5F55\u5165\u4F5C\u54C1\uFF0C\u53EF\u4EE5\u5148\u524D\u5F80\u201C\u8D44\u6599\u5F55\u5165\u201D\u9875\u9762\u4E0A\u4F20\u51E0\u6761\u793A\u4F8B\u3002" })) : (_jsx("div", { className: "media-grid", children: latest.map((m) => (_jsxs(Link, { to: `/media/${m.id}`, className: "media-card", children: [_jsx(MediaCover, { media: m }), _jsxs("div", { className: "media-body", children: [_jsx("h3", { children: m.title }), m.region && _jsxs("p", { className: "media-meta", children: ["\u5730\u57DF\uFF1A", m.region] }), m.performers && _jsxs("p", { className: "media-meta", children: ["\u4F20\u627F\u4EBA\uFF1A", m.performers] })] })] }, m.id))) }))] })] }));
};
export default HomePage;
