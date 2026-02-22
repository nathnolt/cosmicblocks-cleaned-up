import settings from './settings.js'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { startIO } from './game/socket.js'

const port = settings.port

export const app = new Hono()

const server = serve({
  fetch: app.fetch,
  port: port,
})

console.log('running on port ' + port)

startIO(server)
