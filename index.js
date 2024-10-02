import express from 'express'
import { config } from 'dotenv'
import { globalError } from './src/middlewares/global-response.middleware.js'
import eventRouter from './src/modules/event/event.router.js'
import db_connection from './DB/db_connection.js'

config({ path: './config/dev.config.env' })




export const app =express()
db_connection()

app.use(express.json())
app.use('/events',eventRouter)

app.use(globalError)
app.listen(process.env.PORT,()=>console.log("starting Server"))