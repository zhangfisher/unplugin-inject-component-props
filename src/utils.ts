import { Options } from "./types";
import { parse, Lang, SgNode, Range } from '@ast-grep/napi' 
import { trimChars } from "flex-tools/string/trimChars";


function getRule(source:string,rules:Options['rules']){
    if(source in rules){
        return rules[source]
    }else{
        for(let rule of Object.keys(rules)){
            if( new RegExp(rule).test(source)){
                return rules[rule]
            }
        }
    }    
}

function trimAll()


function parseComponent(language:Lang,code:string,rules:Options['rules']){

    const ast = parse(language, code)
        // 找出所有导入的组件列表
        const nodes = ast.root().findAll({
            rule:{
                any:[
                    {
                        kind: 'import_statement',
                        pattern:'import {$$$SPECIFIERS} from $SOURCE'
                    }
                ]
            }
        })
        nodes.forEach(node=>{
            const sourceNode = node.getMatch('SOURCE')
            const specifiersNodes = node.getMultipleMatches('SPECIFIERS')        
            if(sourceNode && specifiersNodes){
                const source = sourceNode.text()
                const specifiers = specifiersNodes.text()
                const components = specifiers.split(',').map(item=>{
                    if(item.includes(' as ')){
                        return item.split(' as ')[1].trim()
                    }
                    return item.trim()
                })

                const rule = getRule(source,rules)
                if(rule){

                }
            }

        })
        


    

}

const code = `import { AudioWaveform } from 'lucide-react'

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  House as House2
} from "lucide-react"

<PieChart/>
`


parseComponent(Lang.Tsx,code,{
    'lucide-react': {
          components: ['*'],
          props: {
            strokeWidth: '{1}',
            size: '{32}'
          }
        }}
    )