import { dishes } from '../../data/cooking'

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
  },
  lifetimes: {
    attached() {
      this.setData({ groups: classifyDishes(dishes) })
    }
  },
  methods: {
    onDishTap(e: any) {
      const { group, index } = e.currentTarget.dataset
      const dish = this.data.groups[group]?.dishes[index]
      if (!dish) return
      this.setData({ showPopup: true, popupDish: dish })
    },
    closePopup() {
      this.setData({ showPopup: false, popupDish: null })
    },
  },
})
