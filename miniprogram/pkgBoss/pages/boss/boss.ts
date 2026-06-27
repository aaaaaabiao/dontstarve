import { getVersion } from '../../../data/version'
import { giants as giantsDst } from '../../data/giants'
import { dlcIcons } from '../../../data/dlc-icons'

function getStatKeys(stats: any): string[] {
  return ['生命值', '伤害', '理智光环'].filter(k => stats && stats[k] !== undefined)
}

function formatStat(val: any): string {
  if (Array.isArray(val)) return val.join(' / ')
  return String(val)
}

Component({
  data: {
    giants: [] as any[],
    showPopup: false,
    popupBoss: null as any,
    popupDlcIcons: [] as any[],
    phases: [] as any[],
    selectedPhase: 0,
    levels: [] as any[],
    selectedLevel: 0,
    currentStats: {} as any,
    statKeys: [] as string[],
    currentImage: '',
    navBarTotalHeight: 64,
  },
  lifetimes: {
    attached() {
      const sysInfo = wx.getSystemInfoSync()
      const statusBarHeight = sysInfo.statusBarHeight || 20
      const navBarTotalHeight = statusBarHeight + 44
      this.setData({ navBarTotalHeight })
      this.loadGiants()
    }
  },
  methods: {
    loadGiants() {
      const version = getVersion()
      let giants
      if (version === 'ds') {
        giants = require('../../data/giants_ds').giants
      } else {
        giants = giantsDst
      }
      this.setData({ giants })
    },

    onVersionChange() {
      this.loadGiants()
    },

    onBossTap(e: any) {
      const index = e.currentTarget.dataset.index
      const boss = this.data.giants[index]
      if (!boss) return

      const phases = boss.phases || []
      const popupDlcIcons = boss.dlc ?
        boss.dlc.map((dlcName: string) => dlcIcons[dlcName]).filter(Boolean) : []

      this.setData({
        showPopup: true,
        popupBoss: boss,
        popupDlcIcons,
        phases,
        selectedPhase: 0,
        selectedLevel: 0
      })

      if (phases.length > 0) {
        this.applyPhase(0)
      } else {
        const stats = boss.stats || {}
        const levels = stats._levels || []
        this.setData({
          currentStats: stats,
          statKeys: getStatKeys(stats),
          levels,
          selectedLevel: 0,
          currentImage: levels.length > 0 ? levels[0].image : boss.image,
        })
      }
    },

    applyPhase(idx: number) {
      const phase = this.data.phases[idx]
      if (!phase) return
      const stats = phase.stats || {}
      const levels = stats._levels || []
      this.setData({
        selectedPhase: idx,
        currentStats: stats,
        statKeys: getStatKeys(stats),
        levels,
        selectedLevel: 0,
        currentImage: levels.length > 0 ? levels[0].image : phase.image,
      })
    },

    onPhaseTap(e: any) {
      this.applyPhase(e.currentTarget.dataset.index)
    },

    onLevelTap(e: any) {
      const idx = e.currentTarget.dataset.index
      const level = this.data.levels[idx]
      if (!level) return
      this.setData({ selectedLevel: idx, currentImage: level.image })
    },

    closePopup() {
      this.setData({ showPopup: false, popupBoss: null, phases: [], levels: [], statKeys: [] })
    },

    // 广告事件
    adLoad() {
      console.log('Boss页原生模板广告加载成功')
    },
    adError(err: any) {
      console.error('Boss页原生模板广告加载失败', err)
    },
    adClose() {
      console.log('Boss页原生模板广告关闭')
    },

    formatStat(val: any) {
      return formatStat(val)
    },
  },
})
