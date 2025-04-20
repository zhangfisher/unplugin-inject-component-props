# vite-inject-props

一个用于在构建时自动为组件注入props的Vite插件。支持React、Vue、Svelte等前端框架的组件。

## 特性

- 🎯 自动为指定组件注入props
- 🔍 支持glob模式和正则表达式匹配文件
- ⚡️ 基于unplugin，支持多种构建工具
- 🛡️ 完整的TypeScript支持

## 安装

```bash
# npm
npm install vite-inject-props -D

# yarn
yarn add vite-inject-props -D

# pnpm
pnpm add vite-inject-props -D
```

## 使用

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import InjectProps from 'vite-inject-props';

export default defineConfig({
  plugins: [
    InjectProps({
      // 只对满足glob条件的文件进行处理
      pattern: /\.(jsx|tsx)$/,
      // 注入规则
      rules: {
        // 为所有从lucide-react导入的组件注入props
        'lucide-react': {
          components: ['*'],
          props: {
            strokeWidth: '{1}',
            size: '{32}'
          }
        },
        // 为特定组件注入props
        '@/components': {
          components: ['Button'],
          props: {
            theme: '"primary"',
            size: '"medium"'
          }
        }
      }
    })
  ]
});
```

## 配置选项

### pattern

- 类型: `string | RegExp | (string | RegExp)[]`
- 默认值: `undefined`

用于指定需要处理的文件。支持以下格式：
- 字符串：glob模式
- 正则表达式
- 字符串或正则表达式数组

```ts
// 示例
pattern: /\.(jsx|tsx)$/
pattern: '**/*.tsx'
pattern: [/\.tsx$/, '**/*.jsx']
```

### rules

- 类型: `Record<string, ComponentRule>`
- 必需: `true`

组件注入规则配置。

```ts
interface ComponentRule {
  // 需要处理的组件名称列表
  components: string[]; // 使用 "*" 表示所有组件
  // 需要注入的props
  props: Record<string, string>;
}
```

## 示例

### 为图标组件注入默认属性

```ts
import InjectProps from 'vite-inject-props';

export default {
  plugins: [
    InjectProps({
      pattern: /\.(jsx|tsx)$/,
      rules: {
        'lucide-react': {
          components: ['*'],
          props: {
            strokeWidth: '{1}',
            size: '{32}'
          }
        }
      }
    })
  ]
}
```

### 为特定组件注入主题属性

```ts
import InjectProps from 'vite-inject-props';

export default {
  plugins: [
    InjectProps({
      pattern: /\.(jsx|tsx)$/,
      rules: {
        '@/components': {
          components: ['Button', 'Input', 'Select'],
          props: {
            theme: '"dark"',
            size: '"medium"'
          }
        }
      }
    })
  ]
}
```

### 使用正则表达式匹配组件

```ts
import InjectProps from 'vite-inject-props';

export default {
  plugins: [
    InjectProps({
      pattern: /\.(jsx|tsx)$/,
      rules: {
        // 匹配所有以Icon结尾的组件
        '^@/icons/.*$': {
          components: ['*'],
          props: {
            size: '{24}',
            color: '"currentColor"'
          }
        }
      }
    })
  ]
}
```

## 注意事项

1. 如果组件已经存在相同名称的prop，插件不会覆盖它
2. prop值需要是有效的JSX表达式字符串：
   - 字符串值需要用引号：`'"value"'`
   - 数字值需要用花括号：`'{42}'`
   - 布尔值需要用花括号：`'{true}'`
3. 插件会保持源代码的格式和注释

## License

MIT
