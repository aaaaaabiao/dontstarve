const fs = require('fs')
const path = require('path')

const rawDir = path.join(__dirname, '../raw-data')
const dataDir = path.join(__dirname, '../miniprogram/data')
const cookingDataDir = path.join(__dirname, '../miniprogram/pkgCooking/data')
const bossDataDir = path.join(__dirname, '../miniprogram/pkgBoss/data')

// 解析命令行参数：--key=value 格式
// 用法示例：
//   node scripts/gen-data.js --items=/path/to/items.json
//   node scripts/gen-data.js --categories-ds=/path/to/ds_cat.json --items-ds=/path/to/ds_items.json
const args = {}
process.argv.slice(2).forEach(arg => {
  const match = arg.match(/^--([^=]+)=(.+)$/)
  if (match) args[match[1]] = match[2]
})

function resolvePath(key, defaultFile) {
  // 用户数据源的实际路径
  const userPaths = {
    'items': '/Users/abiao/coding/scrapers/dontstarve/dontstarve_items.json',
    'items-ds': '/Users/abiao/coding/scrapers/dontstarve/dontstarve_sp_items.json',
    'categories': '/Users/abiao/coding/scrapers/dontstarve/dontstarve_categories.json',
    'categories-ds': '/Users/abiao/coding/scrapers/dontstarve/dontstarve_sp_categories.json',
  }

  if (args[key]) {
    return args[key]
  }
  if (userPaths[key] && fs.existsSync(userPaths[key])) {
    return userPaths[key]
  }
  return path.join(rawDir, defaultFile)
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeTs(dir, filename, content) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, filename), content)
}

// DLC 归一化：统一为 ['巨人国'] / ['海难'] / ['哈姆雷特'] 数组
const DLC_ICON_MAP = {
  '巨人国': 'https://huiji-thumb.huijistatic.com/dontstarve/uploads/thumb/6/6d/Recipe_VANILLA_icon.png/64px-Recipe_VANILLA_icon.png',
  '海难': 'https://huiji-thumb.huijistatic.com/dontstarve/uploads/thumb/b/b7/Recipe_SHIPWRECKED_icon.png/64px-Recipe_SHIPWRECKED_icon.png',
  '哈姆雷特': 'https://huiji-thumb.huijistatic.com/dontstarve/uploads/thumb/a/ab/Recipe_PORKLAND_icon.png/64px-Recipe_PORKLAND_icon.png',
}

function normalizeDlc(dlc) {
  if (!dlc) return []
  if (typeof dlc === 'string') {
    if (dlc === '饥荒') return []
    const match = dlc.match(/：(.+)/)
    if (match) {
      let name = match[1]
      if (name === '猪镇') name = '哈姆雷特'
      return [name]
    }
    return []
  }
  if (Array.isArray(dlc)) {
    return dlc.map(d => d === '猪镇' ? '哈姆雷特' : d)
  }
  return []
}

// 将 dlc 名称数组转为图标 URL 数组
function dlcIcons(dlc) {
  return normalizeDlc(dlc).map(name => DLC_ICON_MAP[name]).filter(Boolean)
}

// ==================== Categories ====================
const catRaw = readJson(resolvePath('categories', 'dontstarve_categories.json'))
if (catRaw) {
  writeTs(dataDir, 'categories.ts',
    'export const categories = ' + JSON.stringify(catRaw.categories) + ';\n')
}

// ==================== Categories DS ====================
const catDsRaw = readJson(resolvePath('categories-ds', 'dontstarve_ds_categories.json'))
if (catDsRaw) {
  // 给每个列表项预计算 dlcIcons
  const cats = catDsRaw.categories.map(cat => {
    if (cat.items) {
      cat.items = cat.items.map(item => {
        item.dlcIcons = dlcIcons(item.dlc)
        item.dlc = normalizeDlc(item.dlc)
        return item
      })
    }
    if (cat.sub_categories) {
      cat.sub_categories = cat.sub_categories.map(sub => {
        if (sub.items) {
          sub.items = sub.items.map(item => {
            item.dlcIcons = dlcIcons(item.dlc)
            item.dlc = normalizeDlc(item.dlc)
            return item
          })
        }
        return sub
      })
    }
    return cat
  })
  writeTs(dataDir, 'categories_ds.ts',
    'export const categories = ' + JSON.stringify(cats) + ';\n')
}

// ==================== Items (联机版) ====================
const itemsRaw = readJson(resolvePath('items', 'dontstarve_items.json'))
if (itemsRaw && catRaw) {
  // 收集分类中引用的物品名称
  const catItemNames = new Set()
  catRaw.categories.forEach(cat => {
    ;(cat.items || []).forEach(item => catItemNames.add(item.name))
    ;(cat.sub_categories || []).forEach(sub => {
      ;(sub.items || []).forEach(item => catItemNames.add(item.name))
    })
  })

  // 精简配方字段
  const slimRecipe = (r) => ({
    name: r.name,
    ingredients: r.ingredients || [],
    description: r.description || '',
    category: r.category || null,
    unlock: r.unlock || null,
    crafting_station: r.crafting_station || null,
  })

  const itemsMap = {}
  itemsRaw.items.forEach(item => {
    if (catItemNames.has(item.name)) {
      itemsMap[item.name] = {
        name: item.name,
        icon: item.icon || '',
        recipes: (item.recipes || []).map(slimRecipe),
        drop_from: item.drop_from || [],
        generated_from: item.generated_from || [],
      }
    }
  })
  console.log(`  联机版: ${itemsRaw.items.length} 个物品 → 保留 ${Object.keys(itemsMap).length} 个`)
  writeTs(dataDir, 'items.ts',
    'export const itemsMap: Record<string, any> = ' + JSON.stringify(itemsMap) + ';\n')
}

// ==================== Items DS (单机版) ====================
const itemsDsRaw = readJson(resolvePath('items-ds', 'dontstarve_sp_items.json'))
if (itemsDsRaw && catDsRaw) {
  // 收集单机版分类引用的物品名称
  const catDsItemNames = new Set()
  catDsRaw.categories.forEach(cat => {
    ;(cat.items || []).forEach(item => catDsItemNames.add(item.name))
    ;(cat.sub_categories || []).forEach(sub => {
      ;(sub.items || []).forEach(item => catDsItemNames.add(item.name))
    })
  })

  // 精简配方字段
  const slimRecipe = (r) => ({
    name: r.name,
    ingredients: r.ingredients || [],
    description: r.description || '',
    category: r.category || null,
    unlock: r.unlock || null,
    crafting_station: r.crafting_station || null,
  })

  const itemsDsMap = {}
  itemsDsRaw.items.forEach(item => {
    if (catDsItemNames.has(item.name)) {
      itemsDsMap[item.name] = {
        name: item.name,
        icon: item.icon || '',
        recipes: (item.recipes || []).map(slimRecipe),
        drop_from: item.drop_from || [],
        generated_from: item.generated_from || [],
        dlc: item.dlc || [],
      }
    }
  })
  console.log(`  单机版: ${itemsDsRaw.items.length} 个物品 → 保留 ${Object.keys(itemsDsMap).length} 个`)
  writeTs(dataDir, 'items_ds.ts',
    'export const itemsMap: Record<string, any> = ' + JSON.stringify(itemsDsMap) + ';\n')
}

// ==================== Cooking ====================
const cookRaw = readJson(resolvePath('cooking', 'dontstarve_cooking.json'))
if (cookRaw) {
  writeTs(cookingDataDir, 'cooking.ts',
    'export const dishes: any[] = ' + JSON.stringify(cookRaw.dishes || []) + ';\n')
}

// ==================== Cooking DS ====================
const cookDsRaw = readJson(resolvePath('cooking-ds', 'dontstarve_ds_cooking.json'))
if (cookDsRaw) {
  const cookDsDishes = (cookDsRaw.dishes || []).map(d => {
    // 修复 image 指向背景图的问题，使用 icon 替代
    if (!d.image || d.image.includes('Inventory_slot_background')) {
      d.image = d.icon || d.image
    }
    d.dlc = normalizeDlc(d.dlc)
    d.dlcIcons = dlcIcons(d.dlc)
    return d
  })
  writeTs(cookingDataDir, 'cooking_ds.ts',
    'export const dishes: any[] = ' + JSON.stringify(cookDsDishes) + ';\n')
}

// ==================== Giants ====================
const giantsRaw = readJson(resolvePath('giants', 'dontstarve_giants.json'))
if (giantsRaw) {
  writeTs(bossDataDir, 'giants.ts',
    'export const giants: any[] = ' + JSON.stringify(giantsRaw.giants || []) + ';\n')
}

// ==================== Giants DS ====================
const giantsDsRaw = readJson(resolvePath('giants-ds', 'dontstarve_ds_giants.json'))
if (giantsDsRaw) {
  // 按名称去重
  const seen = new Set()
  const giantsDs = (giantsDsRaw.giants || []).filter(g => {
    if (seen.has(g.name)) return false
    seen.add(g.name)
    return true
  }).map(g => {
    g.dlc = normalizeDlc(g.dlc)
    g.dlcIcons = dlcIcons(g.dlc)
    return g
  })
  writeTs(bossDataDir, 'giants_ds.ts',
    'export const giants: any[] = ' + JSON.stringify(giantsDs) + ';\n')
}

// ==================== 输出结果 ====================
const generated = []
if (catRaw) generated.push('categories')
if (catDsRaw) generated.push('categories_ds')
if (itemsRaw) generated.push('items')
if (itemsDsRaw) generated.push('items_ds')
if (cookRaw) generated.push('cooking')
if (cookDsRaw) generated.push('cooking_ds')
if (giantsRaw) generated.push('giants')
if (giantsDsRaw) generated.push('giants_ds')

if (generated.length === 0) {
  console.log('⚠ 没有找到任何 JSON 数据文件')
  console.log('')
  console.log('用法：')
  console.log('  node scripts/gen-data.js                                    # 使用默认路径')
  console.log('  node scripts/gen-data.js --items=/path/to/items.json        # 指定路径')
  console.log('  node scripts/gen-data.js --items-ds=/path/to/ds_items.json  # 指定单机版路径')
  console.log('')
  console.log('支持的参数：')
  console.log('  --categories, --categories-ds, --items, --items-ds')
  console.log('  --cooking, --cooking-ds, --giants, --giants-ds')
} else {
  console.log('✓ 已生成: ' + generated.join(', '))
}
