import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { fetchJson } from '../services/api';
const MediaCover = ({ media }) => {
    const [coverUrl, setCoverUrl] = useState(media.coverUrl || null);
    useEffect(() => {
        // 如果coverUrl存在但不是完整URL（是MinIO对象名），则获取临时链接
        if (media.coverUrl && !media.coverUrl.startsWith('http')) {
            fetchJson(`/api/media/${media.id}/cover`)
                .then(setCoverUrl)
                .catch(() => {
                // 如果获取失败，保持为null，显示占位符
                setCoverUrl(null);
            });
        }
    }, [media.id, media.coverUrl]);
    return (_jsxs("div", { className: "media-cover", children: [coverUrl ? (_jsx("img", { src: coverUrl, alt: media.title, className: "media-cover-image" })) : (_jsxs("div", { className: "media-cover-placeholder", children: [media.type === 'AUDIO' && _jsx("span", { className: "media-icon", children: "\uD83C\uDFB5" }), media.type === 'VIDEO' && _jsx("span", { className: "media-icon", children: "\uD83C\uDFAC" }), media.type === 'IMAGE' && _jsx("span", { className: "media-icon", children: "\uD83D\uDDBC\uFE0F" }), media.type === 'DOCUMENT' && _jsx("span", { className: "media-icon", children: "\uD83D\uDCC4" }), media.type === 'LINK' && _jsx("span", { className: "media-icon", children: "\uD83D\uDD17" })] })), _jsx("span", { className: "media-type", children: media.type === 'AUDIO' ? '音频' : media.type === 'VIDEO' ? '视频' : media.type === 'IMAGE' ? '图片' : media.type === 'DOCUMENT' ? '文档' : '链接' })] }));
};
export default MediaCover;
