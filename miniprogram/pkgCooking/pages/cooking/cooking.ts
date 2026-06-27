import { getVersion } from '../../../data/version'
import { dishes as dishesDst } from '../../data/cooking'
import { dlcIcons } from '../../../data/dlc-icons'

function classifyDishes(list: any[]) {
  const groups: Record<string, any[]> = { hunger: [], health: [], sanity: [], other: [] }
  for (const d of list) {
    const fs = d.food_stats || {}
    const hunger = parseFloat(fs.hunger?.value) || 0
    const health = parseFloat(fs.health?.value) || 0
    const sanity = parseFloat(fs.sanity?.value) || 0
    if (hunger >= 60) groups.hunger.push(d)
    else if (health >= 30) groups.health.push(d)
    else if (sanity >= 15) groups.sanity.push(d)
    else groups.other.push(d)
  }
  return [
    { title: '回饥饿值', icon: 'https://huiji-thumb.huijistatic.com/dontstarve/uploads/thumb/4/48/Hunger_Meter.png/40px-Hunger_Meter.png', dishes: groups.hunger },
    { title: '回生命值', icon: 'https://huiji-thumb.huijistatic.com/dontstarve/uploads/thumb/6/6f/Health_Meter.png/40px-Health_Meter.png', dishes: groups.health },
    { title: '回理智值', icon: 'https://huiji-thumb.huijistatic.com/dontstarve/uploads/thumb/2/2f/Sanity_Meter.png/40px-Sanity_Meter.png', dishes: groups.sanity },
    { title: '拉完了', icon: '', dishes: groups.other },
  ].filter(g => g.dishes.length > 0)
}

Component({
  data: {
    groups: [] as any[],
    showPopup: false,
    popupDish: null as any,
    popupDlcIcons: [] as any[],
    navBarTotalHeight: 64,
  },
  lifetimes: {
    attached() {
      const sysInfo = wx.getSystemInfoSync()
      const statusBarHeight = sysInfo.statusBarHeight || 20
      const navBarTotalHeight = statusBarHeight + 44
      this.setData({ navBarTotalHeight })
      this.loadDishes()
    }
  },
  methods: {
    loadDishes() {
      const version = getVersion()
      let dishes
      if (version === 'ds') {
        dishes = require('../../data/cooking_ds').dishes
      } else {
        dishes = dishesDst
      }
      this.setData({ groups: classifyDishes(dishes) })
    },

    onVersionChange() {
      this.loadDishes()
    },

    onDishTap(e: any) {
      const { group, index } = e.currentTarget.dataset
      const dish = this.data.groups[group]?.dishes[index]
      if (!dish) return

      const popupDlcIcons = dish.dlc ?
        dish.dlc.map((dlcName: string) => dlcIcons[dlcName]).filter(Boolean) : []

      this.setData({ showPopup: true, popupDish: dish, popupDlcIcons })
    },
    closePopup() {
      this.setData({ showPopup: false, popupDish: null })
    },

    // 广告事件
    adLoad() {
      console.log('烹饪页原生模板广告加载成功')
    },
    adError(err: any) {
      console.error('烹饪页原生模板广告加载失败', err)
    },
    adClose() {
      console.log('烹饪页原生模板广告关闭')
    },
  },
})
