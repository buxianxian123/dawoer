import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { fetchJson } from '../services/api';
const UploadPage = () => {
    const [form, setForm] = useState({
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
    });
    const [file, setFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [categoryGroups, setCategoryGroups] = useState({});
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
            console.error('获取分类失败:', e);
            setCategoryGroups({});
        }
    };
    useEffect(() => {
        loadCategories();
    }, []);
    const handleInitCategories = async () => {
        try {
            const response = await fetch('/api/categories/init', { method: 'POST' });
            const message = await response.text();
            alert(message);
            // 重新加载分类列表
            await loadCategories();
        }
        catch (e) {
            console.error(e);
            alert('初始化失败，请检查后端是否正常运行');
        }
    };
    const updateField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };
    const toggleCategory = (id) => {
        setForm((prev) => {
            const exists = prev.categoryIds.includes(id);
            return {
                ...prev,
                categoryIds: exists ? prev.categoryIds.filter((x) => x !== id) : [...prev.categoryIds, id],
            };
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);
        try {
            const fd = new FormData();
            fd.append('title', form.title);
            if (form.description)
                fd.append('description', form.description);
            fd.append('type', form.type);
            form.categoryIds.forEach((id) => fd.append('categoryIds', String(id)));
            if (form.tags.trim()) {
                form.tags
                    .split(/[，,\s]+/)
                    .filter(Boolean)
                    .forEach((t) => fd.append('tags', t));
            }
            if (form.scene)
                fd.append('scene', form.scene);
            if (form.lyrics)
                fd.append('lyrics', form.lyrics);
            if (form.region)
                fd.append('region', form.region);
            if (form.performers)
                fd.append('performers', form.performers);
            if (form.recordedAt)
                fd.append('recordedAt', form.recordedAt);
            if (form.source)
                fd.append('source', form.source);
            if (form.uploader)
                fd.append('uploader', form.uploader);
            if (form.type === 'LINK') {
                fd.append('url', form.url);
            }
            else if (file) {
                fd.append('file', file);
            }
            // 如果有封面文件，也一起上传
            if (coverFile) {
                fd.append('coverFile', coverFile);
            }
            const res = await fetch('/api/media', {
                method: 'POST',
                body: fd,
            });
            if (!res.ok) {
                const errorText = await res.text();
                if (res.status === 413 || errorText.includes('size') || errorText.includes('Size')) {
                    throw new Error('文件太大，单个文件不能超过 500MB。如果文件较大，建议压缩后再上传。');
                }
                throw new Error(errorText || '上传失败，请稍后重试');
            }
            setMessage('上传成功，可以在“作品浏览”中查看。');
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
            });
            setFile(null);
            setCoverFile(null);
            setCoverPreview(null);
        }
        catch (err) {
            console.error(err);
            let errorMessage = '上传失败，请稍后重试。';
            if (err.message) {
                errorMessage = err.message;
            }
            else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
                errorMessage = '网络连接失败，请检查后端服务是否正常运行，或文件是否过大导致连接中断。';
            }
            setMessage(errorMessage);
        }
        finally {
            setSubmitting(false);
        }
    };
    const isLink = form.type === 'LINK';
    // 处理文件选择：如果是视频，自动提取封面帧
    const handleFileChange = async (e) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
        // 如果是视频文件，自动提取第一帧作为封面预览
        if (selectedFile && form.type === 'VIDEO' && selectedFile.type.startsWith('video/')) {
            try {
                const videoUrl = URL.createObjectURL(selectedFile);
                const video = document.createElement('video');
                video.src = videoUrl;
                video.currentTime = 1; // 跳到第1秒
                video.muted = true;
                video.onloadeddata = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const frameUrl = canvas.toDataURL('image/jpeg', 0.8);
                        setCoverPreview(frameUrl);
                        // 将canvas转为File对象
                        canvas.toBlob((blob) => {
                            if (blob) {
                                const coverFile = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
                                setCoverFile(coverFile);
                            }
                        }, 'image/jpeg', 0.8);
                    }
                    URL.revokeObjectURL(videoUrl);
                };
                video.onerror = () => {
                    URL.revokeObjectURL(videoUrl);
                };
            }
            catch (err) {
                console.error('提取视频帧失败:', err);
            }
        }
        else if (selectedFile && form.type === 'IMAGE') {
            // 如果是图片，直接作为封面预览
            const reader = new FileReader();
            reader.onload = (e) => {
                setCoverPreview(e.target?.result);
                setCoverFile(selectedFile);
            };
            reader.readAsDataURL(selectedFile);
        }
        else {
            // 其他类型清空封面
            setCoverPreview(null);
            setCoverFile(null);
        }
    };
    // 手动选择封面图
    const handleCoverChange = (e) => {
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setCoverFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (e) => {
                setCoverPreview(e.target?.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };
    // 当媒体类型改变时，清空封面
    const handleTypeChange = (newType) => {
        updateField('type', newType);
        setCoverPreview(null);
        setCoverFile(null);
        setFile(null);
    };
    return (_jsx("div", { className: "page", children: _jsxs("section", { className: "section", children: [_jsx("h1", { children: "\u8D44\u6599\u5F55\u5165" }), _jsx("p", { className: "section-intro", children: "\u7528\u4E8E\u5F55\u5165\u8FBE\u65A1\u5C14\u65CF\u4F20\u7EDF\u97F3\u4E50\u7684\u97F3\u9891 / \u89C6\u9891 / \u6587\u732E\u8D44\u6599\u3002 \u4F60\u53EF\u4EE5\u5C3D\u53EF\u80FD\u586B\u5199\u6C11\u4FD7\u573A\u666F\u3001\u6B4C\u8BCD\u3001\u5730\u57DF\u3001\u4F20\u627F\u4EBA\u7B49\u4FE1\u606F\uFF0C\u540E\u7EED\u53EF\u4EE5\u76F4\u63A5\u5728\u8BBA\u6587\u4E2D\u5F15\u7528\u3002" }), _jsxs("form", { className: "form", onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-row", children: [_jsx("label", { children: "\u6807\u9898 *" }), _jsx("input", { type: "text", value: form.title, onChange: (e) => updateField('title', e.target.value), required: true })] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "\u7B80\u4ECB" }), _jsx("textarea", { value: form.description, onChange: (e) => updateField('description', e.target.value), rows: 3 })] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "\u5A92\u4F53\u7C7B\u578B *" }), _jsxs("select", { value: form.type, onChange: (e) => handleTypeChange(e.target.value), children: [_jsx("option", { value: "AUDIO", children: "\u97F3\u9891" }), _jsx("option", { value: "VIDEO", children: "\u89C6\u9891" }), _jsx("option", { value: "IMAGE", children: "\u56FE\u7247" }), _jsx("option", { value: "DOCUMENT", children: "\u6587\u6863" }), _jsx("option", { value: "LINK", children: "\u5916\u90E8\u94FE\u63A5" })] })] }), _jsxs("div", { className: "form-row", children: [_jsxs("label", { children: ["\u6240\u5C5E\u5206\u7C7B", Object.keys(categoryGroups).length === 0 && (_jsx("button", { type: "button", onClick: handleInitCategories, className: "btn-init-categories", style: { marginLeft: '12px', fontSize: '13px', padding: '4px 12px' }, children: "\u521D\u59CB\u5316\u5206\u7C7B" }))] }), Object.keys(categoryGroups).length === 0 ? (_jsx("div", { className: "form-hint", children: "\u6682\u65E0\u5206\u7C7B\u3002\u70B9\u51FB\u4E0A\u65B9\"\u521D\u59CB\u5316\u5206\u7C7B\"\u6309\u94AE\u81EA\u52A8\u521B\u5EFA\u5206\u7C7B\u4F53\u7CFB\uFF0C\u6216\u91CD\u542F\u540E\u7AEF\u5E94\u7528\uFF08\u4F1A\u81EA\u52A8\u521D\u59CB\u5316\uFF09\u3002" })) : (_jsx("div", { className: "category-groups", children: Object.entries(categoryGroups).map(([parentName, subCategories]) => (_jsxs("div", { className: "category-group", children: [_jsx("div", { className: "category-group-title", children: parentName }), _jsx("div", { className: "category-group-items", children: subCategories.map((c) => (_jsxs("label", { className: "category-chip", children: [_jsx("input", { type: "checkbox", checked: form.categoryIds.includes(c.id), onChange: () => toggleCategory(c.id) }), _jsx("span", { children: c.name })] }, c.id))) })] }, parentName))) }))] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "\u6807\u7B7E\uFF08\u7528\u9017\u53F7\u6216\u7A7A\u683C\u5206\u9694\uFF09" }), _jsx("input", { type: "text", placeholder: "\u5982\uFF1A\u5FB7\u83AB\u65E5\u6839 \u6728\u5E93\u8FDE \u5973\u58F0\u72EC\u5531 \u6885\u91CC\u65AF", value: form.tags, onChange: (e) => updateField('tags', e.target.value) })] }), !isLink && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "form-row", children: [_jsx("label", { children: "\u4E0A\u4F20\u6587\u4EF6 *" }), _jsx("input", { type: "file", accept: form.type === 'VIDEO' ? 'video/*' : form.type === 'AUDIO' ? 'audio/*' : form.type === 'IMAGE' ? 'image/*' : '*', onChange: handleFileChange }), file && (_jsxs("div", { className: "file-info", children: ["\u5DF2\u9009\u62E9\uFF1A", file.name, " (", (file.size / 1024 / 1024).toFixed(2), " MB)"] }))] }), (form.type === 'VIDEO' || form.type === 'IMAGE') && (_jsxs("div", { className: "form-row", children: [_jsxs("label", { children: ["\u5C01\u9762\u56FE ", form.type === 'VIDEO' && '(视频会自动提取第1秒画面，也可手动上传)'] }), coverPreview && (_jsxs("div", { className: "cover-preview", children: [_jsx("img", { src: coverPreview, alt: "\u5C01\u9762\u9884\u89C8" }), _jsx("button", { type: "button", className: "btn-remove-cover", onClick: () => {
                                                        setCoverPreview(null);
                                                        setCoverFile(null);
                                                    }, children: "\u79FB\u9664\u5C01\u9762" })] })), _jsx("input", { type: "file", accept: "image/*", onChange: handleCoverChange, style: { marginTop: coverPreview ? '12px' : '0' } })] }))] })), isLink && (_jsxs("div", { className: "form-row", children: [_jsx("label", { children: "\u5916\u90E8\u94FE\u63A5 URL *" }), _jsx("input", { type: "url", placeholder: "\u5982\uFF1AB\u7AD9 / \u6296\u97F3 / \u6587\u732E\u6570\u636E\u5E93\u94FE\u63A5", value: form.url, onChange: (e) => updateField('url', e.target.value) })] })), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "\u6C11\u4FD7\u573A\u666F\u8BF4\u660E" }), _jsx("textarea", { value: form.scene, onChange: (e) => updateField('scene', e.target.value), rows: 3, placeholder: "\u5982\uFF1A\u5A5A\u793C\u8FCE\u4EB2\u73AF\u8282\u65B0\u5A18\u5165\u95E8\u524D\uFF0C\u7531\u5973\u6027\u4EB2\u5C5E\u56F4\u5750\u5728\u7095\u6CBF\u6F14\u5531\u2026\u2026" })] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "\u6B4C\u8BCD\u4E0E\u8BD1\u6587" }), _jsx("textarea", { value: form.lyrics, onChange: (e) => updateField('lyrics', e.target.value), rows: 4, placeholder: "\u53EF\u4EE5\u5199\uFF1A\u8FBE\u65A1\u5C14\u8BED\u539F\u6587 + \u6C49\u8BED\u5927\u610F\u3002" })] }), _jsxs("div", { className: "form-row two-col", children: [_jsxs("div", { children: [_jsx("label", { children: "\u5730\u57DF" }), _jsx("input", { type: "text", placeholder: "\u5982\uFF1A\u9ED1\u9F99\u6C5F\u7701\u9F50\u9F50\u54C8\u5C14\u5E02\u6885\u91CC\u65AF\u8FBE\u65A1\u5C14\u65CF\u533A", value: form.region, onChange: (e) => updateField('region', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { children: "\u4F20\u627F\u4EBA / \u6F14\u5531\u8005" }), _jsx("input", { type: "text", placeholder: "\u5982\uFF1A\u67D0\u67D0\u5DF4\u56FE\uFF08\u7537\uFF0C68 \u5C81\uFF09", value: form.performers, onChange: (e) => updateField('performers', e.target.value) })] })] }), _jsxs("div", { className: "form-row two-col", children: [_jsxs("div", { children: [_jsx("label", { children: "\u91C7\u96C6\u65E5\u671F" }), _jsx("input", { type: "date", value: form.recordedAt, onChange: (e) => updateField('recordedAt', e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { children: "\u8D44\u6599\u6765\u6E90" }), _jsx("input", { type: "text", placeholder: "\u5982\uFF1A2024 \u5E74\u6691\u671F\u7530\u91CE\u81EA\u5F55 / \u67D0\u6863\u6848\u9986 / \u67D0\u89C6\u9891\u7F51\u7AD9", value: form.source, onChange: (e) => updateField('source', e.target.value) })] })] }), _jsxs("div", { className: "form-row", children: [_jsx("label", { children: "\u5F55\u5165\u8005" }), _jsx("input", { type: "text", placeholder: "\u53EF\u4EE5\u5199\u81EA\u5DF1\u7684\u540D\u5B57\uFF0C\u4FBF\u4E8E\u540E\u7EED\u7BA1\u7406", value: form.uploader, onChange: (e) => updateField('uploader', e.target.value) })] }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "submit", className: "btn primary", disabled: submitting, children: submitting ? '上传中...' : '提交' }), message && (_jsx("span", { className: `form-message ${message.includes('成功') ? 'success' : 'error'}`, children: message }))] })] })] }) }));
};
export default UploadPage;
