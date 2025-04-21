/**
 * 组件注入规则
 * key: prop名称
 * value: prop值（字符串或布尔值）
 */
export type Rule = {
  source: string | RegExp
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
    * 组件注入规则数组
    */
   rules: Rule[];
}
 