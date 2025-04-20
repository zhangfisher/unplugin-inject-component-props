import { createUnplugin } from 'unplugin'
import type { UnpluginFactory } from 'unplugin'
import type { Options } from './types'
 
import { minimatch } from 'minimatch'; 

/**
 * 检查文件是否匹配pattern
 */
function isFileMatched(id: string, pattern?: string | RegExp | (string | RegExp)[]): boolean {
  if (!pattern) return true;  
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  return patterns.some(p => {
    if (typeof p === 'string') {
      return minimatch(id, p);
    }
    return p.test(id);
  });
}
   

export const unpluginFactory: UnpluginFactory<Options> = options => {
  const opts = Object.assign({
      pattern: "**/*.{vue,jsx,tsx,.svelte,.mdx}",
      rules:[]
  }, options) as Required<Options>
  const hasRules = opts.rules && Object.keys(opts.rules).length > 0;
  return {
    name: 'unplugin-inject-component-props',
    transformInclude(id) {
      return hasRules && isFileMatched(id, opts.pattern) 
    },
    transform(code, id) {
            
      
    },
  }
}
export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin