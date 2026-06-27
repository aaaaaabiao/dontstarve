import { getVersion, setVersion } from '../../data/version'

Component({
  properties: {
    title: {
      type: String,
      value: '饥荒字典'
    }
  },

  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
    version: 'dst' as 'ds' | 'dst'
  },

  lifetimes: {
    attached() {
      const sysInfo = wx.getSystemInfoSync()
      const statusBarHeight = sysInfo.statusBarHeight || 20

      this.setData({
        statusBarHeight,
        version: getVersion()
      })
    }
  },

  methods: {
    onVersionTap(e: any) {
      const newVersion = e.currentTarget.dataset.version as 'ds' | 'dst'
      if (newVersion === this.data.version) return

      setVersion(newVersion)
      this.setData({ version: newVersion })

      // 触发自定义事件，通知页面重新加载数据
      this.triggerEvent('versionchange', { version: newVersion })
    }
  }
})
