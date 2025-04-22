import { createUnplugin } from 'unplugin'
import type { UnpluginFactory } from 'unplugin'
import type { Options } from './types'
import { minimatch } from 'minimatch'
import MagicString from 'magic-string'

/**
 * 检查文件是否匹配pattern，支持排除模式（使用!前缀）
 */
function isFileMatched(id: string, pattern?: (string | RegExp)[]): boolean {
  if (!pattern) return true;
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  
  // 分离包含和排除模式
  const includePatterns: (string | RegExp)[] = [];
  const excludePatterns: (string | RegExp)[] = [];
  
  patterns.forEach(p => {
    if (typeof p === 'string' && p.startsWith('!')) {
      excludePatterns.push(p.slice(1)); // 移除!前缀
    } else {
      includePatterns.push(p);
    }
  });

  // 如果文件匹配任何排除模式，则返回false
  if (excludePatterns.length > 0) {
    const isExcluded = excludePatterns.some(p => {
      if (typeof p === 'string') {
        return minimatch(id, p);
      }
      return p.test(id);
    });
    if (isExcluded) return false;
  }

  // 如果没有包含模式，且文件不在排除列表中，则返回true
  if (includePatterns.length === 0) return true;

  // 检查文件是否匹配任何包含模式
  return includePatterns.some(p => {
    if (typeof p === 'string') {
      return minimatch(id, p);
    }
    return p.test(id);
  });
}

/**
 * 匹配组件导入语句
 * @param code 源代码
 * @param source 组件来源
 * @returns 匹配到的组件名称数组
 */
function findComponentImports(code: string, source: string | RegExp): string[] {
  let importRegex;
  if (source instanceof RegExp) {
    // 处理正则表达式source
    const sourcePattern = source.source
      .replace(/^\^/, '')
      .replace(/\$/, '')
      .replace(/\\\./g, '.');
    importRegex = new RegExp(
      `import\\s+(?:{\\s*([^}]+)\\s*}|([\\w]+))\\s+from\\s+['"][^'"]*${sourcePattern}[^'"]*['"]`,
      'g'
    );
  } else {
    // 处理字符串source
    importRegex = new RegExp(
      `import\\s+(?:{\\s*([^}]+)\\s*}|([\\w]+))\\s+from\\s+['"]${source.replace(/\./g, '\\.')}['"]`,
      'g'
    );
  }

  const components: string[] = [];
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    if (match[1]) { // 解构导入
      const names = match[1].split(',')
        .map(name => name.trim().split(/\s+as\s+/)[0]) // 处理别名
        .filter(name => name); // 过滤空值
      components.push(...names);
    } else if (match[2]) { // 默认导入
      components.push(match[2]);
    }
  }
  return components;
}

/**
 * 检查组件名称是否匹配规则
 */
function isComponentMatched(componentName: string, pattern: string | RegExp): boolean {
  if (pattern === '*') return true;
  if (pattern instanceof RegExp) return pattern.test(componentName);
  return componentName === pattern;
}

export const unpluginFactory: UnpluginFactory<Options> = options => {
  // 合并默认选项和用户选项
  const opts = Object.assign({
    pattern: [
      
    ],
    rules: [],
    debug: false
  }, options) as Required<Options>

  opts.pattern.push(...[
        /\.(vue|jsx|tsx|svelte|mdx)$/,
        "!**/node_modules/**",         // 默认排除 node_modules
        "!**/dist/**",                 // 默认排除 dist
        "!**/build/**",                // 默认排除 build
        "!**/.git/**"                  // 默认排除 .git
  ])

  // 检查是否有注入规则
  const hasRules = opts.rules.length > 0; 

  return {
    name: 'unplugin-inject-props',
    enforce: 'pre',
    transformInclude(id) {
      const shouldInclude = hasRules && isFileMatched(id, opts.pattern);
      if (opts.debug) {
        console.log(`[unplugin-inject-props] File: ${id}, Include: ${shouldInclude}`);
      }
      return shouldInclude;
    },
    transform(code, id) {
      try {
        // 创建magic-string实例用于代码修改
        const s = new MagicString(code);
        let hasChanges = false;

        // 遍历每个注入规则
        for (const rule of opts.rules) {
          // 获取从该source导入的组件
          const importedComponents = findComponentImports(code, rule.source);

          // 遍历每个导入的组件
          for (const componentName of importedComponents) {
            // 检查组件是否需要处理
            if (!rule.components.some(pattern => isComponentMatched(componentName, pattern))) {
              continue;
            }

            // 改进的组件标签匹配正则表达式，使用词边界确保完整匹配组件名
            const componentRegex = new RegExp(
              `(<${componentName}\\b)(\\s*[^>]*?)(\\s*/?\\s*>)`,
              'g'
            );

            let componentMatch;
            while ((componentMatch = componentRegex.exec(code)) !== null) {
              const [fullMatch, openTag, existingProps = '', closeTag] = componentMatch;

              // 构建要注入的props
              const propsToInject = Object.entries(rule.props)
                .filter(([propName]) => {
                  // 更精确的prop存在性检查
                  const propPattern = new RegExp(
                    `(?:^|\\s)${propName}\\s*=\\s*(?:["'{])`,
                    'm'
                  );
                  return !propPattern.test(existingProps);
                })
                .map(([propName, propValue]) => {
                  // 处理不同类型的prop值
                  if (/^["'].*["']$/.test(propValue)) {
                    // 字符串值，保持原样
                    return `${propName}=${propValue}`;
                  } else if (/^{.*}$/.test(propValue)) {
                    // 已经包含花括号的表达式，直接使用
                    return `${propName}=${propValue}`;
                  } else {
                    // 普通表达式，添加花括号
                    return `${propName}={${propValue}}`;
                  }
                })
                .join(' ');

              if (propsToInject) {
                // 在结束标记之前插入props
                const insertPosition = componentMatch.index + openTag.length;
                s.appendRight(insertPosition, ` ${propsToInject}`);
                hasChanges = true;
              }
            }
          }
        }

        // 只有在有修改时才返回新代码
        return hasChanges ? {
          code: s.toString(),
          map: s.generateMap()
        } : null;

      } catch (error) {
        // 记录错误但不中断构建过程
        console.error(`[unplugin-inject-props] Error processing ${id}:`, error);
        return code
      }
    }
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin