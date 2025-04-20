import type { Node } from '@babel/types';

/**
 * 组件注入规则
 * key: prop名称
 * value: prop值（字符串或布尔值）
 */
export type ComponentRule = {
  components:(string | RegExp)[]
  props: Record<string, string>
};

export interface Options {
   /**
   * 文件匹配模式
   * 支持以下格式:
   * - 字符串：glob 模式
   * - 正则表达式
   * - 字符串或正则表达式数组
   */
   pattern?: string | RegExp | (string | RegExp)[];
   /**
    * 组件注入规则
    * key: 包名或导入路径或正则表达式
    * value: 组件注入规则
    */
   rules: Record<string, ComponentRule>;
}

export type BabelNode = Node;

export interface ImportInfo {
  source: string;
  components: Map<string, string>;
}

export interface ComponentUsage {
  name: string;
  start: number;
  end: number;
  existingProps: Set<string>;
}