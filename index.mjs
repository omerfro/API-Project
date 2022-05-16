import express from 'express';
import log from '@ajar/marker';
import morgan       from 'morgan';
import cors from 'cors';

import {connect_db} from './db/mongoose_connection.mjs'
import user_router from './modules/user/users.router.mjs';

import {error_handler,error_handler2,not_found} from './middleware/errors.handler.mjs'

const { PORT = 8080, HOST = 'localhost', DB_URI } = process.env;

const app = express();

//midlleware usage
app.use(cors())
app.use(morgan('dev'))

//routing
app.use("/api/users",user_router);

//error handling
app.use(error_handler)
app.use(error_handler2)

app.use('*',not_found)

//start the express api server
;(async ()=> {
    await connect_db(DB_URI);
    await app.listen(PORT,HOST);
    log.magenta(`🌎  listening on`,`http://${HOST}:${PORT}`);
})().catch(console.log)

