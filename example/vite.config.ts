import { defineConfig, PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import Inspect from 'vite-plugin-inspect'
import InjectProps from "../src/vite" 

export default defineConfig({
  plugins: [
        InjectProps({
            debug:true,
            rules: [
                {
                    source: "lucide-react",
                    components: ["*"],
                    props: {
                        'color': '"red"',
                        'strokeWidth':'{1}',
                        'size': '{32}'
                    }
                }
            ]
        }) as PluginOption,
        react() as PluginOption,         
        Inspect() as PluginOption,       
    ],
})