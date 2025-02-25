# 在 iCloud Drive 下创建目录 `docusaurus`, 命令行进入 `docusaurus`
```
npm init docusaurus@latest
```

What should we name this site? docs-test
默认选择向下执行...

# 托管 github
**新建仓库 `docs-test`**
```
git init
git add .
git commit -m 'project int'
git remote add origin https://github.com/jkxyx205/docs-test.git
git push -u origin main
```
- 开启 github pages。docs-test/Settings/Pages/, Source 设置 Github Actions
- 创建部署文件.github/workflows/deploy.yml。提示词：「docusaurus 自动部署到 GitHub Pages, 写一下部署的yml」，下面的配置是通过 Claude 3.5 sonnet 生成的
`deploy.yml`
```yml
name: Deploy Docusaurus to GitHub Pages
on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build website
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: build

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
提交 push ,如果成功部署可以访问： https://jkxyx205.github.io/docs-test/

WARNING:
> For GitHub pages deployment, it is often '&lt;/projectName/&gt;'
> 
> baseUrl: '/docs-test/' # 非自定义域名
>
> 使用自定义域名时，就可以把 `baseUrl: '/projectName/'` 改回 `baseUrl: '/'` 了，也可以把 `url` 设置成你的自定义域名。


# 绑定域名
- 添加域名解析docs-test CNAME jkxyx205.github.io
- docs-test/Settings/Pages/Custom domain 填写域名 docs-test.xxx.com 并保存
- Enforce HTTPS 勾选，http 会自动跳转到 https

[Deployment](https://docusaurus.io/docs/next/deployment)

[https://github.com/jkxyx205/docs-test](https://github.com/jkxyx205/docs-test)
