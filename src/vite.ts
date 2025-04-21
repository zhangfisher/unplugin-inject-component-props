import { createVitePlugin } from 'unplugin'
import { unpluginFactory } from '.'
import { Options } from './types'

export default createVitePlugin<Options>(unpluginFactory)
