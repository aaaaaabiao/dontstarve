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
  return args[key] || path.join(rawDir, defaultFile)
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

// ==================== Categories ====================
const catRaw = readJson(resolvePath('categories', 'dontstarve_categories.json'))
if (catRaw) {
  writeTs(dataDir, 'categories.ts',
    'export const categories = ' + JSON.stringify(catRaw.categories) + ';\n')
}

// ==================== Categories DS ====================
const catDsRaw = readJson(resolvePath('categories-ds', 'dontstarve_ds_categories.json'))
if (catDsRaw) {
  writeTs(dataDir, 'categories_ds.ts',
    'export const categories = ' + JSON.stringify(catDsRaw.categories) + ';\n')
}

// ==================== Items ====================
const itemsRaw = readJson(resolvePath('items', 'dontstarve_items.json'))
if (itemsRaw) {
  const itemsMap = {}
  itemsRaw.items.forEach(item => {
    itemsMap[item.name] = {
      name: item.name,
      image: item.image || '',
      icon: item.icon || '',
      categories: item.categories || [],
      recipes: item.recipes || [],
      drop_from: item.drop_from || [],
      generated_from: item.generated_from || [],
      dlc: normalizeDlc(item.dlc),
    }
  })
  writeTs(dataDir, 'items.ts',
    'export const itemsMap: Record<string, any> = ' + JSON.stringify(itemsMap) + ';\n')
}

// ==================== Items DS ====================
const itemsDsRaw = readJson(resolvePath('items-ds', 'dontstarve_ds_items.json'))
if (itemsDsRaw) {
  const itemsDsMap = {}
  itemsDsRaw.items.forEach(item => {
    itemsDsMap[item.name] = {
      name: item.name,
      image: item.image || '',
      icon: item.icon || '',
      categories: item.categories || [],
      recipes: item.recipes || [],
      drop_from: item.drop_from || [],
      generated_from: item.generated_from || [],
      dlc: normalizeDlc(item.dlc),
    }
  })
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
