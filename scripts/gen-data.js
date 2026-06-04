const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '../miniprogram/data')

// categories
const catRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'dontstarve_categories.json'), 'utf8'))
fs.writeFileSync(
  path.join(dataDir, 'categories.ts'),
  'export const categories = ' + JSON.stringify(catRaw.categories) + ';\n'
)

// items (from dontstarve_items.json)
const itemsRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'dontstarve_items.json'), 'utf8'))
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
  }
})
fs.writeFileSync(
  path.join(dataDir, 'items.ts'),
  'export const itemsMap: Record<string, any> = ' + JSON.stringify(itemsMap) + ';\n'
)

// cooking (from dontstarve_cooking.json)
const cookPath = path.join(dataDir, 'dontstarve_cooking.json')
if (fs.existsSync(cookPath)) {
  const cookRaw = JSON.parse(fs.readFileSync(cookPath, 'utf8'))
  fs.writeFileSync(
    path.join(dataDir, 'cooking.ts'),
    'export const dishes: any[] = ' + JSON.stringify(cookRaw.dishes || []) + ';\n'
  )
}

console.log('✓ categories.ts, items.ts, cooking.ts generated')
