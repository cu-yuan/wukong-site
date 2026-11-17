# 黑神话：悟空 · 七页专题

一个纯静态的中文专题站点，以《黑神话：悟空》为线索，讲六回山水、十二位人物、三重棍势、
十三则影神图与二十七处山西古建。全部页面手写 HTML / CSS / JavaScript：山水场景用开放授权照片调色，
众生、棍法、影神图三页配 Steam 商店页的官方游戏截图。

## 页面

| 文件 | 标题 | 内容 |
| --- | --- | --- |
| `index.html` | 首页 | 水墨夜空主视觉、六回入口、影神图预览、数据条 |
| `world.html` | 六回 | 黑风山 → 黄风岭 → 小西天 → 盘丝岭 → 火焰山 → 花果山，附六根 |
| `characters.html` | 众生 | 十二位人物，按「同行 / 大圣 / 群妖 / 故人」筛选 |
| `combat.html` | 棍法 | 劈、立、戳三重棍势，六道法术，变化与随身之物 |
| `bestiary.html` | 影神图 | 十三则图鉴，可分类筛选、搜索、点开看完整小传 |
| `culture.html` | 考据 | 纸本长文、山西古建清单、陕北说书与时间线 |
| `about.html` | 关于 | 制作说明、页面清单、原创与版权声明 |

## 目录

```
wukong-site/
├─ index.html  world.html  characters.html  combat.html
├─ bestiary.html  culture.html  about.html
├─ css/style.css
├─ js/main.js
├─ assets/            # 8 张调色照片 + 7 张官方截图 + favicon.svg
├─ .nojekyll          # 让 GitHub Pages 原样发布，不走 Jekyll
└─ README.md
```

## 本地预览

直接双击 `index.html` 即可。若想更接近线上环境：

```bash
cd wukong-site
python -m http.server 8000
# 浏览器打开 http://localhost:8000/
```

## 技术点

- 语义化标签：`header / nav / main / section / article / figure / footer`，每页有 `h1` 与跳转链接。
- 布局：Flex 与 Grid，`clamp()` 做流式字号与间距；断点 1120 / 980 / 900 / 720 / 520。
- 视觉：CSS 变量统一黑金配色；宋体标题 + 楷体点缀；细金线、印章、金箍圆环。
- 交互：滚动进度、导航变色、`IntersectionObserver` 入场、数字滚动、canvas 余烬粒子、
  人物与图鉴筛选、图鉴搜索与弹窗、棍势标签切换、移动端全屏菜单。
- 可用性：`prefers-reduced-motion` 降级、键盘可操作的弹窗（Esc 关闭、焦点归还）、
  `aria-current` / `aria-expanded` / `aria-controls`、跳至主内容链接。
- 无框架、无构建、无外部字体与 CDN，断网也能完整显示。

## 素材与版权

- 场景照片（六回场景、首页结尾的黄山云海、考据页悬空寺）取自 Wikimedia Commons 的开放授权作品，
  作者与许可详见 `about.html` 的「场景照片来源」；为统一视觉，统一做了去色、压暗与墨金色调处理。
- 官方剧照（首页主视觉、众生、棍法、影神图）来自 Steam 商店页，版权归游戏科学所有，仅作课程展示，详见「官方截图来源」。
- 站点图标 `favicon.svg` 为手绘。
- 文字为二次整理与再叙述，不是游戏原文；涉及的游戏事实（发售日期、销量、奖项等）以公开报道为准。
- 《黑神话：悟空》及相关名称、角色的著作权归游戏科学（Game Science）所有，本站仅作课程作业与非商业展示。

## 部署

站点为纯静态文件，可直接用 GitHub Pages 发布：仓库根目录放 `index.html`，
在 Settings → Pages 选择 `main` 分支的 `/ (root)` 即可。
