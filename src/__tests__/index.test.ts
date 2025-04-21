import { describe, it, expect } from 'vitest'
import { unpluginFactory } from '../index'
import { Options } from '../types'
import { UnpluginOptions } from 'unplugin'

describe('unplugin-inject-component-props', () => {
 
  describe('transform', () => {
    const createPlugin = (options:Options ) => unpluginFactory(options,{} as any)

    it('should inject props for exact component match', () => {
      const plugin = createPlugin({
        rules: [{
          source: '@/components',
          components: ['Button'],
          props: {
            theme: '"dark"',
            size: '"medium"'
          }
        }]
      }) as UnpluginOptions 

      const code = `
        import { Button } from '@/components'
        export default function App() {
          return <Button>Click me</Button>
        }
      `
      // @ts-ignore
      const result = plugin.transform(code, 'test.tsx')
      expect(result?.code).toContain('<Button theme="dark" size="medium">')
    })

    it('should not duplicate existing props', () => {
      const plugin = createPlugin({
        rules: [{
          source: '@/components',
          components: ['Button'],
          props: {
            theme: '"dark"',
            size: '"medium"'
          }
        }]
      })

      const code = `
        import { Button } from '@/components'
        export default function App() {
          return <Button theme="light">Click me</Button>
        }
      `
      // @ts-ignore
      const result = plugin.transform(code, 'test.tsx')
      expect(result?.code).toContain('<Button theme="light" size="medium">')
    })

    it('should match components using regex', () => {
      const plugin = createPlugin({
        rules: [{
          source: '@/components',
          components: [/^Base[A-Z]/],
          props: {
            variant: '"standard"'
          }
        }]
      })

      const code = `
        import { BaseButton, BaseInput } from '@/components'
        export default function App() {
          return (
            <>
              <BaseButton>Click me</BaseButton>
              <BaseInput />
            </>
          )
        }
      `
      // @ts-ignore
      const result = plugin.transform(code, 'test.tsx')
      expect(result?.code).toContain('<BaseButton variant="standard">')
      expect(result?.code).toContain('<BaseInput  variant="standard"')
    })

    it('should handle dynamic prop values', () => {
      const plugin = createPlugin({
        rules: [{
          source: '@/components',
          components: ['ThemeProvider'],
          props: {
            theme: '{defaultTheme}',
            debug: '{process.env.NODE_ENV === "development"}'
          }
        }]
      })

      const code = `
        import { ThemeProvider } from '@/components'
        import { defaultTheme } from '@/themes'
        export default function App() {
          return <ThemeProvider>Content</ThemeProvider>
        }
      `
      // @ts-ignore
      const result = plugin.transform(code, 'test.tsx')
      expect(result?.code).toContain('theme={defaultTheme}')
      expect(result?.code).toContain('debug={process.env.NODE_ENV === "development"}')
    })

    it('should handle source with regex', () => {
      const plugin = createPlugin({
        rules: [{
          source: /^@material-ui/,
          components: ['Button'],
          props: {
            variant: '"outlined"'
          }
        }]
      })

      const code = `
        import { Button } from '@material-ui/core'
        export default function App() {
          return <Button>Click me</Button>
        }
      `
        // @ts-ignore
      const result = plugin.transform(code, 'test.tsx')
      expect(result?.code).toContain('<Button variant="outlined">')
    })

    it('should handle multiple rules', () => {
      const plugin = createPlugin({
        rules: [
          {
            source: '@/components',
            components: ['Button'],
            props: {
              theme: '"dark"'
            }
          },
          {
            source: '@material-ui/core',
            components: ['Input'],
            props: {
              variant: '"outlined"'
            }
          }
        ]
      })

      const code = `
        import { Button } from '@/components'
        import { Input } from '@material-ui/core'
        export default function App() {
          return (
            <>
              <Button>Click me</Button>
              <Input />
            </>
          )
        }
      `
      // @ts-ignore
      const result = plugin.transform(code, 'test.tsx')
      expect(result?.code).toContain('<Button theme="dark">')
      expect(result?.code).toContain('<Input  variant="outlined"')
    })

    it('should correctly handle self-closing tags with props injection', () => {
      const plugin = createPlugin({
        rules: [{
          source: '@/components',
          components: ['Input'],
          props: {
            size: '"large"',
            variant: '"outlined"'
          }
        }]
      })

      const code = `
        import { Input } from '@/components'
        export default function App() {
          return <Input />
        }
      `
      // @ts-ignore
      const result = plugin.transform(code, 'test.tsx')
      expect(result?.code).toContain('<Input  size="large" variant="outlined"/>')
    })
  })
})