const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '../miniprogram/data')

// categories
const catRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'dontstarve_categories.json'), 'utf8'))
fs.writeFileSync(
  path.join(dataDir, 'categories.ts'),
  'export const categories = ' + JSON.stringify(catRaw.categories) + ';\n'
)

// recipes
const recRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'dontstarve_recipes.json'), 'utf8'))
const recipeMap = {}
recRaw.items.forEach(item => {
  recipeMap[item.name] = item.recipes || []
})
fs.writeFileSync(
  path.join(dataDir, 'recipes.ts'),
  'export const recipes: Record<string, any[]> = ' + JSON.stringify(recipeMap) + ';\n'
)

console.log('✓ categories.ts and recipes.ts generated')
