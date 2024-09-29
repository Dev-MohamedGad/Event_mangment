import express from 'express'
import db_connection from './db/db_connection.js'
import { config } from 'dotenv'
import { globalError } from './src/middlewares/global-response.middleware.js'
import eventRouter from './src/modules/event/event.router.js'

config({ path: './config/dev.config.env' })




const app =express()
app.use(express.json())
app.use('/events',eventRouter)
app.use(globalError)
db_connection()
app.listen(process.env.PORT,()=>console.log("starting Server"))