const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../miniprogram/data');

function stripRecipes(filename) {
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`⚠ ${filename} 不存在，跳过`);
    return;
  }

  console.log(`处理 ${filename}...`);
  const content = fs.readFileSync(filepath, 'utf8');

  // 解析 TS 文件中的 JSON 数据
  const match = content.match(/export const itemsMap: Record<string, any> = (.+);\n?$/);
  if (!match) {
    console.log(`⚠ 无法解析 ${filename}`);
    return;
  }

  const itemsMap = JSON.parse(match[1]);
  const count = Object.keys(itemsMap).length;

  // 移除每个物品的 recipes 字段
  Object.keys(itemsMap).forEach(name => {
    delete itemsMap[name].recipes;
  });

  // 重新写入
  const newContent = 'export const itemsMap: Record<string, any> = ' +
    JSON.stringify(itemsMap) + ';\n';
  fs.writeFileSync(filepath, newContent);

  const oldSize = content.length;
  const newSize = newContent.length;
  const saved = ((oldSize - newSize) / 1024).toFixed(2);

  console.log(`✓ ${filename}: ${count} 个物品，移除 recipes，节省 ${saved} KB`);
}

stripRecipes('items.ts');
stripRecipes('items_ds.ts');

console.log('\n完成！');
