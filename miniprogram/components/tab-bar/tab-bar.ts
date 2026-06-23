Component({
  properties: {
    active: { type: Number, value: 0 }
  },
  data: {
    tabs: [
      { text: '制作', path: '/pages/index/index', icon: '/images/tab-craft.png', activeIcon: '/images/tab-craft-active.png' },
      { text: '烹饪', path: '/pkgCooking/pages/cooking/cooking', icon: '/images/tab-cooking.png', activeIcon: '/images/tab-cooking-active.png' },
      { text: 'Boss', path: '/pkgBoss/pages/boss/boss', icon: '/images/tab-boss.png', activeIcon: '/images/tab-boss-active.png' },
    ]
  },
  methods: {
    onTabTap(e: any) {
      const idx = e.currentTarget.dataset.index
      if (idx === this.data.active) return
      const path = this.data.tabs[idx].path
      if (path === '/pages/index/index') {
        wx.reLaunch({ url: path })
      } else {
        wx.redirectTo({ url: path })
      }
    }
  }
})
