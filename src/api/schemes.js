import { getToken } from './auth'

function authHeaders() {
  const token = getToken()
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

export async function fetchTemplates() {
  const res = await fetch('/templates')
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '无法加载模板列表')
  return data
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
