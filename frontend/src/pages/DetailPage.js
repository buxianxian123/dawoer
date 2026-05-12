import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchJson } from '../services/api';
const DetailPage = () => {
    const { id } = useParams();
    const [media, setMedia] = useState(null);
    const [url, setUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const load = async () => {
            if (!id)
                return;
            try {
                const data = await fetchJson(`/api/media/${id}`);
                setMedia(data);
                const u = await fetchJson(`/api/media/${id}/url`);
                setUrl(u);
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);
    if (loading)
        return _jsx("div", { className: "page", children: "\u52A0\u8F7D\u4E2D..." });
    if (!media)
        return _jsx("div", { className: "page", children: "\u672A\u627E\u5230\u8BE5\u4F5C\u54C1\u3002" });
    const isExternalLink = media.type === 'LINK';
    return (_jsx("div", { className: "page", children: _jsxs("section", { className: "section", children: [_jsx("h1", { children: media.title }), _jsxs("p", { className: "media-meta-line", children: [media.type && _jsxs("span", { children: ["\u7C7B\u578B\uFF1A", media.type, "\u3000"] }), media.region && _jsxs("span", { children: ["\u5730\u57DF\uFF1A", media.region, "\u3000"] }), media.performers && _jsxs("span", { children: ["\u4F20\u627F\u4EBA\uFF1A", media.performers, "\u3000"] }), media.recordedAt && _jsxs("span", { children: ["\u91C7\u96C6\u65E5\u671F\uFF1A", media.recordedAt] })] }), url && (_jsx("div", { className: "player-wrapper", children: isExternalLink ? (_jsx("a", { href: url, target: "_blank", rel: "noreferrer", className: "btn primary", children: "\u524D\u5F80\u5916\u90E8\u94FE\u63A5\u64AD\u653E / \u67E5\u770B" })) : media.type === 'AUDIO' ? (_jsx("audio", { controls: true, src: url, children: "\u60A8\u7684\u6D4F\u89C8\u5668\u4E0D\u652F\u6301 audio \u64AD\u653E\u3002" })) : media.type === 'VIDEO' ? (_jsx("video", { controls: true, src: url })) : media.type === 'IMAGE' ? (_jsx("img", { src: url, alt: media.title })) : (_jsx("a", { href: url, target: "_blank", rel: "noreferrer", className: "btn", children: "\u4E0B\u8F7D / \u6253\u5F00\u6587\u4EF6" })) })), media.description && (_jsxs(_Fragment, { children: [_jsx("h2", { children: "\u4F5C\u54C1\u7B80\u4ECB" }), _jsx("p", { children: media.description })] })), media.scene && (_jsxs(_Fragment, { children: [_jsx("h2", { children: "\u6C11\u4FD7\u573A\u666F\u8BF4\u660E" }), _jsx("p", { children: media.scene })] })), media.lyrics && (_jsxs(_Fragment, { children: [_jsx("h2", { children: "\u6B4C\u8BCD\u4E0E\u8BD1\u6587" }), _jsx("pre", { className: "lyrics-block", children: media.lyrics })] })), media.source && (_jsxs(_Fragment, { children: [_jsx("h2", { children: "\u8D44\u6599\u6765\u6E90" }), _jsx("p", { children: media.source })] }))] }) }));
};
export default DetailPage;
