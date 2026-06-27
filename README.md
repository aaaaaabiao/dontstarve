# 饥荒字典小程序

饥荒游戏工具制作字典微信小程序，支持联机版和单机版数据切换。

## 数据同步

### 数据源路径

所有 JSON 数据文件位于：`/Users/abiao/coding/scrapers/dontstarve`

### 同步命令

在爬虫目录更新 JSON 文件后，在项目根目录执行：

```bash
npm run gen
```

脚本会自动：
1. 读取 `/Users/abiao/coding/scrapers/dontstarve` 下的 8 个 JSON 文件
2. 精简、过滤、转换数据（去重、DLC 归一化、图标预计算等）
3. 生成对应的 `.ts` 文件到小程序各子包

### 数据文件映射

| JSON 文件 | 生成目标 | 用途 |
|---|---|---|
| `dontstarve_categories.json` | `miniprogram/data/categories.ts` | 联机版分类 |
| `dontstarve_sp_categories.json` | `miniprogram/data/categories_ds.ts` | 单机版分类 |
| `dontstarve_items.json` | `miniprogram/data/items.ts` | 联机版物品 |
| `dontstarve_sp_items.json` | `miniprogram/data/items_ds.ts` | 单机版物品 |
| `dontstarve_cooking.json` | `miniprogram/pkgCooking/data/cooking.ts` | 联机版烹饪 |
| `dontstarve_sp_cooking.json` | `miniprogram/pkgCooking/data/cooking_ds.ts` | 单机版烹饪 |
| `dontstarve_giants.json` | `miniprogram/pkgBoss/data/giants.ts` | 联机版Boss |
| `dontstarve_sp_giants.json` | `miniprogram/pkgBoss/data/giants_ds.ts` | 单机版Boss |

### 指定路径

如果只需要更新某个数据，可以用参数指定路径：

```bash
npm run gen -- --items=/path/to/custom_items.json
```

支持的参数：
- `--categories` / `--categories-ds`
- `--items` / `--items-ds`
- `--cooking` / `--cooking-ds`
- `--giants` / `--giants-ds`

## 项目结构

```
miniprogram/
├── data/                    # 主包数据（分类、物品）
├── pages/                   # 主包页面
├── components/              # 组件
├── pkgCooking/data/         # 烹饪子包数据
└── pkgBoss/data/            # Boss子包数据
```

## 开发

```bash
# 同步数据
npm run gen

# 启动微信开发者工具
# 在微信开发者工具中打开项目根目录
```
