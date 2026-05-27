// index.ts
import { categories } from '../../data/categories'
import { recipes } from '../../data/recipes'

Component({
  data: {
    categories: [] as any[],
    selectedIndex: -1,
    selectedName: '',
    items: [] as any[],
    subCategories: [] as any[],
    selectedItem: '',
    selectedItemImage: '',
    recipeList: [] as any[],
  },
  lifetimes: {
    attached() {
      this.setData({ categories })
    }
  },
  methods: {
    onCategoryTap(e: any) {
      const index = e.currentTarget.dataset.index
      const category = categories[index]
      if (!category) return

      const data: any = {
        selectedIndex: index,
        selectedName: category.name,
        items: [],
        subCategories: [],
        selectedItem: '',
        selectedItemImage: '',
        recipeList: [],
      }

      if (category.items && category.items.length > 0) {
        data.items = category.items
      } else if (category.sub_categories && category.sub_categories.length > 0) {
        data.subCategories = category.sub_categories
      }

      this.setData(data)
    },

    onItemTap(e: any) {
      const name = e.currentTarget.dataset.name
      const recipeList = recipes[name] || []

      let itemImage = ''
      const allItems = [
        ...this.data.items,
        ...this.data.subCategories.reduce((acc: any[], sub: any) => acc.concat(sub.items || []), [])
      ]
      const found = allItems.find((it: any) => it.name === name)
      if (found) itemImage = found.image

      this.setData({
        selectedItem: name,
        selectedItemImage: itemImage,
        recipeList,
      })
    },
  },
})
