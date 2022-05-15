import express from 'express';
import log from '@ajar/marker';
import morgan       from 'morgan';

import apiRoute from './routers/users.router.mjs';

const { PORT, HOST } = process.env;


//midlleware usage
const app = express();

app.use(morgan('dev'))

app.use('/users',apiRoute);


//middleware functions

const errorHandle = `<h1>Page not found!!</h1>
        <p>It could be for some reasons:</p>
        <ul>
            <li>page not wrote</li>
            <li>lazy developers</li>
            <li>some bullshits</li>  
        </ul>`

app.use('*',(req,res) => {
    res.status(404).send(errorHandle)
})

app.use((err,req,res,next) => {
    console.log('error handler', err.message);
    res.status(500).json({status:err.message});
})

app.listen(PORT, HOST,  ()=> {
    log.magenta(`🌎  listening on`,`http://${HOST}:${PORT}`);
});
