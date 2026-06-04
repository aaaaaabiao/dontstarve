import { dishes } from '../../data/cooking'

Component({
  data: {
    dishes: [] as any[],
    showPopup: false,
    popupDish: null as any,
  },
  lifetimes: {
    attached() {
      this.setData({ dishes })
    }
  },
  methods: {
    onDishTap(e: any) {
      const index = e.currentTarget.dataset.index
      const dish = this.data.dishes[index]
      if (!dish) return
      this.setData({ showPopup: true, popupDish: dish })
    },
    closePopup() {
      this.setData({ showPopup: false, popupDish: null })
    },
  },
})
