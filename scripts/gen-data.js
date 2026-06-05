const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '../miniprogram/data')

// categories
const catPath = path.join(dataDir, 'dontstarve_categories.json')
if (fs.existsSync(catPath)) {
  const catRaw = JSON.parse(fs.readFileSync(catPath, 'utf8'))
  fs.writeFileSync(
    path.join(dataDir, 'categories.ts'),
    'export const categories = ' + JSON.stringify(catRaw.categories) + ';\n'
  )
}

// items (from dontstarve_items.json)
const itemsPath = path.join(dataDir, 'dontstarve_items.json')
if (fs.existsSync(itemsPath)) {
  const itemsRaw = JSON.parse(fs.readFileSync(itemsPath, 'utf8'))
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
}

// cooking (from dontstarve_cooking.json)
const cookPath = path.join(dataDir, 'dontstarve_cooking.json')
if (fs.existsSync(cookPath)) {
  const cookRaw = JSON.parse(fs.readFileSync(cookPath, 'utf8'))
  fs.writeFileSync(
    path.join(dataDir, 'cooking.ts'),
    'export const dishes: any[] = ' + JSON.stringify(cookRaw.dishes || []) + ';\n'
  )
}

// giants (from dontstarve_giants.json)
const giantsPath = path.join(dataDir, 'dontstarve_giants.json')
if (fs.existsSync(giantsPath)) {
  const giantsRaw = JSON.parse(fs.readFileSync(giantsPath, 'utf8'))
  fs.writeFileSync(
    path.join(dataDir, 'giants.ts'),
    'export const giants: any[] = ' + JSON.stringify(giantsRaw.giants || []) + ';\n'
  )
}

console.log('✓ categories.ts, items.ts, cooking.ts, giants.ts generated')
