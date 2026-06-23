// index.ts
import { categories } from '../../data/categories'
import { itemsMap } from '../../data/items'

Component({
  data: {
    categories: [] as any[],
    selectedIndex: -1,
    selectedName: '',
    items: [] as any[],
    subCategories: [] as any[],
    selectedSubIndex: -1,
    selectedItem: '',
    selectedItemImage: '',
    recipeList: [] as any[],
    showPopup: false,
    popupItem: null as any,
  },
  lifetimes: {
    attached() {
      this.setData({ categories })
      this.onCategoryTap({ currentTarget: { dataset: { index: 1 } } })
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
        selectedSubIndex: -1,
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

    onSubCategoryTap(e: any) {
      const index = e.currentTarget.dataset.index
      const sub = this.data.subCategories[index]
      if (!sub) return
      this.setData({
        selectedSubIndex: index,
        items: sub.items || [],
        selectedItem: '',
        selectedItemImage: '',
        recipeList: [],
      })
    },

    onItemTap(e: any) {
      const name = e.currentTarget.dataset.name
      const item = itemsMap[name]

      let itemImage = ''
      if (item) {
        itemImage = item.image
      } else {
        const allItems = [
          ...this.data.items,
          ...this.data.subCategories.reduce((acc: any[], sub: any) => acc.concat(sub.items || []), [])
        ]
        const found = allItems.find((it: any) => it.name === name)
        if (found) itemImage = found.image
      }

      this.setData({ selectedItem: name, selectedItemImage: itemImage })

      if (item) {
        this.setData({ showPopup: true, popupItem: item })
      }
    },

    onIngredientTap(e: any) {
      const name = e.currentTarget.dataset.name
      if (!name) return
      const item = itemsMap[name]
      if (!item) {
        wx.showToast({ title: '未找到该物品信息', icon: 'none' })
        return
      }
      this.setData({ showPopup: true, popupItem: item })
    },

    closePopup() {
      this.setData({ showPopup: false, popupItem: null })
    },

    onPopupIngredientTap(e: any) {
      const name = e.currentTarget.dataset.name
      if (!name) return
      const item = itemsMap[name]
      if (!item) {
        wx.showToast({ title: '未找到该物品信息', icon: 'none' })
        return
      }
      this.setData({ popupItem: item })
    },
  },
})
