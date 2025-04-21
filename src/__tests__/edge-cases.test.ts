import { describe, it, expect } from 'vitest'
import { unpluginFactory } from '../index'

describe('unplugin-inject-component-props edge cases', () => {
  describe('empty and invalid inputs', () => {
    it('should handle empty code', () => {
      const plugin = unpluginFactory({
        rules: [{
          source: '@/components',
          components: ['Button'],
          props: {
            theme: '"dark"'
          }
        }]
      })

      const result = plugin.transform('', 'test.tsx')
      expect(result).toBeNull()
    })

    it('should handle undefined options', () => {
      const plugin = unpluginFactory(undefined)
      const result = plugin.transform('const x = 1;', 'test.tsx')
      expect(result).toBeNull()
    })

    it('should handle empty rules array', () => {
      const plugin = unpluginFactory({
        rules: []
      })
      const result = plugin.transform('const x = 1;', 'test.tsx')
      expect(result).toBeNull()
    })
  })

  describe('complex component usage', () => {
    it('should handle self-closing tags', () => {
      const plugin = unpluginFactory({
        rules: [{
          source: '@/components',
          components: ['Input'],
          props: {
            size: '"medium"'
          }
        }]
      })

      const code = `
        import { Input } from '@/components'
        export default function App() {
          return <Input />
        }
      `

      const result = plugin.transform(code, 'test.tsx')
      expect(result?.code).toContain('<Input size="medium" />')
    })

    it('should handle components with existing complex props', () => {
      const plugin = unpluginFactory({
        rules: [{
          source: '@/components',
          components: ['Button'],
          props: {
            theme: '"dark"',
            onClick: 'handleClick'
          }
        }]
      })

      const code = `
        import { Button } from '@/components'
        export default function App() {
          return <Button className="my-class" style={{ color: 'red' }} data-testid="btn">Click</Button>
        }
      `

      const result = plugin.transform(code, 'test.tsx')
      expect(result?.code).toContain('theme="dark"')
      expect(result?.code).toContain('onClick={handleClick}')
      expect(result?.code).toContain('className="my-class"')
      expect(result?.code).toContain('style={{ color: \'red\' }}')
    })

    it('should handle multiple components on the same line', () => {
      const plugin = unpluginFactory({
        rules: [{
          source: '@/components',
          components: ['Button', 'Input'],
          props: {
            size: '"small"'
          }
        }]
      })

      const code = `
        import { Button, Input } from '@/components'
        export default function App() {
          return <div><Button>Click</Button><Input /></div>
        }
      `

      const result = plugin.transform(code, 'test.tsx')
      expect(result?.code).toContain('<Button size="small">')
      expect(result?.code).toContain('<Input size="small" />')
    })
  })

  describe('import variations', () => {
    it('should handle renamed imports', () => {
      const plugin = unpluginFactory({
        rules: [{
          source: '@/components',
          components: ['Button'],
          props: {
            theme: '"dark"'
          }
        }]
      })

      const code = `
        import { Button as CustomButton } from '@/components'
        export default function App() {
          return <CustomButton>Click</CustomButton>
        }
      `

      const result = plugin.transform(code, 'test.tsx')
      expect(result?.code).toContain('<CustomButton theme="dark">')
    })

    it('should handle default imports', () => {
      const plugin = unpluginFactory({
        rules: [{
          source: '@/components/Button',
          components: ['default'],
          props: {
            theme: '"dark"'
          }
        }]
      })

      const code = `
        import Button from '@/components/Button'
        export default function App() {
          return <Button>Click</Button>
        }
      `

      const result = plugin.transform(code, 'test.tsx')
      expect(result?.code).toContain('<Button theme="dark">')
    })
  })

  describe('sourcemap generation', () => {
    it('should generate sourcemap when code is modified', () => {
      const plugin = unpluginFactory({
        rules: [{
          source: '@/components',
          components: ['Button'],
          props: {
            theme: '"dark"'
          }
        }]
      })

      const code = `
        import { Button } from '@/components'
        export default function App() {
          return <Button>Click</Button>
        }
      `

      const result = plugin.transform(code, 'test.tsx')
      expect(result?.map).toBeTruthy()
    })

    it('should not generate sourcemap when code is not modified', () => {
      const plugin = unpluginFactory({
        rules: [{
          source: '@/components',
          components: ['Button'],
          props: {
            theme: '"dark"'
          }
        }]
      })

      const code = `
        import { Input } from '@/components'
        export default function App() {
          return <Input>Click</Input>
        }
      `

      const result = plugin.transform(code, 'test.tsx')
      expect(result).toBeNull()
    })
  })
})