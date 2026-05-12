export async function fetchJson(url, init) {
    const res = await fetch(url, init);
    if (!res.ok) {
        throw new Error(`请求失败：${res.status}`);
    }
    // 部分接口（如 /api/media/{id}/url）直接返回字符串
    const text = await res.text();
    try {
        return JSON.parse(text);
    }
    catch {
        return text;
    }
}
