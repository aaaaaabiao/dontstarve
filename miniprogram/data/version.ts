// 版本状态管理
let currentVersion: 'ds' | 'dst' = 'dst'

export function getVersion(): 'ds' | 'dst' {
  if (!currentVersion) {
    currentVersion = (wx.getStorageSync('version') || 'dst') as 'ds' | 'dst'
  }
  return currentVersion
}

export function setVersion(v: 'ds' | 'dst') {
  currentVersion = v
  wx.setStorageSync('version', v)
}

export function toggleVersion(): 'ds' | 'dst' {
  const v = currentVersion === 'dst' ? 'ds' : 'dst'
  setVersion(v)
  return v
}
