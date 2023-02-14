
import express , { Express ,Request , Response } from 'express';
import reflectMetaData from 'reflect-metadata'
import cors from 'cors';
import bodyparser from 'body-parser'
import cookieParser from 'cookie-parser'
import passport from 'passport';
import { initializeJwtStrategy } from './strategies/jwtStrategy';
import swaggerDocs from './utils/swagger'

import config from './config/index'
import { corsOptions } from './config/corsOptions';
import connection from './database/connection';
import  userRouter from './api/routes/userRoutes'

//initialize express app and database connection
const app : Express = express()
connection()

//import middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use((bodyparser.urlencoded({ extended: true })))
app.use(cookieParser());
initializeJwtStrategy(passport)

//import user related routes
app.use('/user', userRouter)

//listen on port number passed by user, which can be set in .env file
app.listen(config.port, () => {
    console.log(`Server running at ${config.port}`)
    swaggerDocs(app, config.port)
})