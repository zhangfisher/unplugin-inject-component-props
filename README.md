# unplugin-inject-component-props

[![NPM version](https://img.shields.io/npm/v/unplugin-inject-component-props?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-inject-component-props)

自动为组件注入props的unplugin插件。

## 特性

- 🎯 精确匹配 - 支持多种文件和组件匹配模式
- � 智能注入 - 自动避免重复的props
- 📍 Sourcemap支持 - 便于调试
- 🛠 框架无关 - 支持Vue、React、Svelte等

## 安装

```bash
npm i unplugin-inject-component-props -D
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import InjectProps from 'unplugin-inject-component-props/vite'

export default defineConfig({
  plugins: [
    InjectProps({ /* options */ }),
  ],
})
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import InjectProps from 'unplugin-inject-component-props/rollup'

export default {
  plugins: [
    InjectProps({ /* options */ }),
  ],
}
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-inject-component-props/webpack')({ /* options */ })
  ]
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import InjectProps from 'unplugin-inject-component-props/esbuild'

build({
  plugins: [InjectProps({ /* options */ })],
})
```

<br></details>

## 配置

```ts
InjectProps({
  // 匹配需要处理的文件
  // 支持 glob 模式、正则表达式或它们的数组
  pattern: '**/*.{vue,jsx,tsx}',

  // 注入规则
  rules: [
    {
      // 组件来源，支持字符串或正则表达式
      source: '@/components',
      
      // 要处理的组件名称，支持字符串、正则表达式或它们的数组
      components: ['Button', 'Input', /^Base[A-Z]/],
      
      // 要注入的props
      props: {
        theme: '"dark"',
        size: '"medium"'
      }
    },
    {
      source: /^@material-ui/,
      components: '*', // '*' 表示匹配所有组件
      props: {
        variant: '"outlined"',
        color: '"primary"'
      }
    }
  ]
})
```

## 使用示例

### 基础用法

```tsx
// 配置
InjectProps({
  pattern: '**/*.tsx',
  rules: [
    {
      source: '@/components',
      components: ['Button'],
      props: {
        size: '"medium"',
        theme: '"dark"'
      }
    }
  ]
})

// 源代码
import { Button } from '@/components'

function App() {
  return <Button>Click me</Button>
}

// 转换后
import { Button } from '@/components'

function App() {
  return <Button size="medium" theme="dark">Click me</Button>
}
```

### 使用正则表达式匹配组件

```tsx
// 配置
InjectProps({
  pattern: '**/*.tsx',
  rules: [
    {
      source: '@/components',
      components: [/^Base[A-Z]/], // 匹配所有Base开头的组件
      props: {
        variant: '"standard"'
      }
    }
  ]
})

// 源代码
import { BaseButton, BaseInput } from '@/components'

function App() {
  return (
    <>
      <BaseButton>Click me</BaseButton>
      <BaseInput placeholder="Type here" />
    </>
  )
}

// 转换后
import { BaseButton, BaseInput } from '@/components'

function App() {
  return (
    <>
      <BaseButton variant="standard">Click me</BaseButton>
      <BaseInput variant="standard" placeholder="Type here" />
    </>
  )
}
```

### 动态Props值

```tsx
// 配置
InjectProps({
  pattern: '**/*.tsx',
  rules: [
    {
      source: '@/components',
      components: ['ThemeProvider'],
      props: {
        theme: 'defaultTheme', // 不带引号，将作为变量注入
        debug: 'process.env.NODE_ENV === "development"' // 支持表达式
      }
    }
  ]
})

// 源代码
import { ThemeProvider } from '@/components'
import { defaultTheme } from '@/themes'

function App() {
  return <ThemeProvider>...</ThemeProvider>
}

// 转换后
import { ThemeProvider } from '@/components'
import { defaultTheme } from '@/themes'

function App() {
  return <ThemeProvider theme={defaultTheme} debug={process.env.NODE_ENV === "development"}>...</ThemeProvider>
}
```

## 类型定义

```ts
interface Options {
  /**
   * 匹配需要处理的文件
   * @default '**/*.{vue,jsx,tsx,.svelte,.mdx}'
   */
  pattern?: string | RegExp | (string | RegExp)[]

  /**
   * 组件注入规则数组
   */
  rules: Rule[]
}

interface Rule {
  /**
   * 组件来源
   * 可以是包名、路径或正则表达式
   */
  source: string | RegExp

  /**
   * 要处理的组件名称
   * 可以是组件名、正则表达式或它们的数组
   * 使用 '*' 匹配所有组件
   */
  components: string | RegExp | (string | RegExp)[] | '*'

  /**
   * 要注入的props
   * key: prop名称
   * value: prop值（字符串形式的表达式）
   */
  props: Record<string, string>
}
```

## 注意事项

1. props值需要是字符串形式的表达式：
   - 字符串值需要带引号：`"value"`
   - 变量和表达式不需要带引号：`myVariable`、`1 + 2`

2. 已存在的props不会被覆盖，插件会智能地只注入缺少的props。

3. 确保source和components的匹配模式足够精确，避免误匹配。

## License

[MIT](./LICENSE) License © 2024