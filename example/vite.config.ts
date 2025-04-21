import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Inspect from 'vite-plugin-inspect'
import InjectProps from "../src/vite" 

export default defineConfig({
  plugins: [
        InjectProps({
            rules: [
                {
                    source:"lucide-react",
                    components: ["*"],
                    props: {
                        "title": "Hello World"
                    }
                }
            ]
        }),
        react(),         
        Inspect(),       
    ],
})
