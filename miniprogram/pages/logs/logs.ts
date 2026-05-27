// logs.ts
import { categories } from '../../data/categories'

Component({
  data: {
    categoryName: '',
    items: [] as any[],
    subCategories: [] as any[],
  },
  lifetimes: {
    attached() {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const options = (currentPage as any).options || {}
      const index = parseInt(options.index || '0')
      const category = categories[index]

      if (!category) return

      wx.setNavigationBarTitle({ title: category.name })

      if (category.items && category.items.length > 0) {
        this.setData({
          categoryName: category.name,
          items: category.items,
        })
      } else if (category.sub_categories && category.sub_categories.length > 0) {
        this.setData({
          categoryName: category.name,
          subCategories: category.sub_categories,
        })
      }
    }
  },
})
