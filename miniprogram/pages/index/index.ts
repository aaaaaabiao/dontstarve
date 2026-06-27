// index.ts
import { getVersion } from '../../data/version'
import { dlcIcons } from '../../data/dlc-icons'

Component({
  data: {
    categories: [] as any[],
    selectedIndex: -1,
    selectedName: '',
    items: [] as any[],
    subCategories: [] as any[],
    selectedSubIndex: -1,
    selectedItem: '',
    recipeList: [] as any[],
    showPopup: false,
    popupItem: null as any,
    popupDlcIcons: [] as any[],
    navBarTotalHeight: 64,
    scrollHeight: 500,
    version: 'dst' as 'ds' | 'dst',
    dlcIcons,
  },
  lifetimes: {
    attached() {
      const sysInfo = wx.getSystemInfoSync()
      const statusBarHeight = sysInfo.statusBarHeight || 20
      const navBarTotalHeight = statusBarHeight + 44
      this.setData({ navBarTotalHeight })
      this.loadData()
    },
    ready() {
      this.calcScrollHeight()
    }
  },
  methods: {
    calcScrollHeight() {
      const query = this.createSelectorQuery()
      query.select('.category-grid').boundingClientRect()
      query.select('.section-title').boundingClientRect()
      query.select('.sub-category-row').boundingClientRect()
      query.exec((res: any) => {
        const sysInfo = wx.getSystemInfoSync()
        const windowHeight = sysInfo.windowHeight
        const navBarTotalHeight = this.data.navBarTotalHeight
        const tabbarHeight = 50

        let usedHeight = navBarTotalHeight + tabbarHeight
        if (res[0]) usedHeight += res[0].height  // category-grid
        if (res[1]) usedHeight += res[1].height  // section-title
        if (res[2]) usedHeight += res[2].height  // sub-category-row

        const scrollHeight = windowHeight - usedHeight
        if (scrollHeight > 100) {
          this.setData({ scrollHeight })
        }
      })
    },
    loadData() {
      const ver = getVersion()
      let categories, itemsMap

      if (ver === 'ds') {
        const dsData = require('../../data/categories_ds')
        categories = dsData.categories
        itemsMap = require('../../data/items_ds').itemsMap
      } else {
        categories = require('../../data/categories').categories
        itemsMap = require('../../data/items').itemsMap
      }

      this.setData({ categories, itemsMap, version: ver })
      this.onCategoryTap({ currentTarget: { dataset: { index: 1 } } })
    },

    onVersionChange() {
      this.loadData()
    },

    onCategoryTap(e: any) {
      const index = e.currentTarget.dataset.index
      const category = this.data.categories[index]
      if (!category) return

      const data: any = {
        selectedIndex: index,
        selectedName: category.name,
        items: [],
        subCategories: [],
        selectedSubIndex: -1,
        selectedItem: '',
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
        recipeList: [],
      })
    },

    // 从 itemsMap 中查找物品的 recipes
    findItemRecipes(name: string) {
      const item = this.data.itemsMap[name]
      return item?.recipes || []
    },

    onItemTap(e: any) {
      const name = e.currentTarget.dataset.name
      const item = this.data.itemsMap[name]

      // 从分类数据中查找 recipes
      const recipes = this.findItemRecipes(name)

      this.setData({
        selectedItem: name,
        recipeList: recipes
      })

      if (item) {
        // Populate DLC icons for single-player mode
        const popupDlcIcons = this.data.version === 'ds' && item.dlc ?
          item.dlc.map((dlcName: string) => dlcIcons[dlcName]).filter(Boolean) : []
        this.setData({ showPopup: true, popupItem: item, popupDlcIcons })
      }
    },

    onIngredientTap(e: any) {
      const name = e.currentTarget.dataset.name
      if (!name) return
      const item = this.data.itemsMap[name]
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
      const item = this.data.itemsMap[name]
      if (!item) {
        wx.showToast({ title: '未找到该物品信息', icon: 'none' })
        return
      }
      this.setData({ popupItem: item })
    },

    // 广告事件
    adLoad() {
      console.log('原生模板广告加载成功')
    },
    adError(err: any) {
      console.error('原生模板广告加载失败', err)
    },
    adClose() {
      console.log('原生模板广告关闭')
    },
  },
})
