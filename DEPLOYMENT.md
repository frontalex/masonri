# Deployment Instructions

## 1. GitHub Repository Setup

### Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `masonri`
3. Description: "A performant and lightweight masonry grid component for Vue 3 and Nuxt"
4. Make it public
5. Don't initialize with README (we already have one)

### Push to GitHub
```bash
git push -u origin main
```

## 2. GitHub Pages Setup

### Enable GitHub Pages
1. Go to your repository settings
2. Scroll to "Pages" section
3. Source: "GitHub Actions"
4. The workflow will automatically deploy on push to main

### Manual Deploy (if needed)
```bash
npm run demo:generate
```

## 3. NPM Publication

### Prerequisites
- Make sure you're logged in to npm: `npm login`
- Verify your account: `npm whoami`

### Publish to NPM
```bash
# Test the package first
npm pack

# Publish to npm
npm publish

# For scoped packages (if needed)
npm publish --access public
```

### Version Updates
```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major

# Then publish
npm publish
```

## 4. Verification

### Check NPM Package
- Visit: https://www.npmjs.com/package/masonri
- Test installation: `npm install masonri`

### Check GitHub Pages
- Visit: https://frontalex.github.io/masonri
- Should show the demo application

### Check Repository
- Visit: https://github.com/frontalex/masonri
- Verify all files are present
- Check that Actions are running successfully

## 5. Post-Publication

### Update README badges (optional)
Add these badges to README.md:

```markdown
[![npm version](https://badge.fury.io/js/masonri.svg)](https://badge.fury.io/js/masonri)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://frontalex.github.io/masonri)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

### Social Media / Community
- Share on Twitter, Reddit, Vue community
- Submit to awesome-vue lists
- Consider writing a blog post

## Troubleshooting

### GitHub Pages not working
- Check Actions tab for build errors
- Ensure `.nojekyll` file exists in output
- Verify `baseURL` in nuxt.config.ts

### NPM publish fails
- Check if package name is available
- Verify you're logged in: `npm whoami`
- Check package.json for required fields

### Build errors
- Run `npm run build` locally first
- Check TypeScript errors
- Verify all dependencies are installed