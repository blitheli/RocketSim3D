import { getToken } from './auth'

function authHeaders() {
  const token = getToken()
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

function formatTemplateFileName(file) {
  return file.replace(/\.json$/i, '').replace(/_/g, ' ')
}

async function enrichTemplateNames(entries) {
  return Promise.all(
    entries.map(async (entry) => {
      if (entry.name) return entry
      try {
        const payload = await fetchTemplate(entry.file)
        return {
          ...entry,
          name: payload.RocketInput?.Name ?? formatTemplateFileName(entry.file),
        }
      } catch {
        return { ...entry, name: formatTemplateFileName(entry.file) }
      }
    }),
  )
}

export async function fetchTemplates() {
  const res = await fetch('/templates')
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '无法加载模板列表')
  if (!Array.isArray(data) || data.length === 0) return data
  if (data.every((entry) => entry.name)) return data
  return enrichTemplateNames(data)
}

export async function fetchTemplate(filename) {
  const res = await fetch(`/templates/${encodeURIComponent(filename)}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '无法加载模板')
  return data
}

export async function fetchUserSchemes() {
  const res = await fetch('/schemes', { headers: authHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '无法加载方案列表')
  return data
}

export async function loadUserScheme(id) {
  const res = await fetch(`/schemes/${encodeURIComponent(id)}`, { headers: authHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '无法加载方案')
  return data
}

export async function saveUserScheme(name, payload) {
  const res = await fetch('/schemes', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, payload }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '保存失败')
  return data
}

export async function deleteUserScheme(id) {
  const res = await fetch(`/schemes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '删除失败')
  return data
}
