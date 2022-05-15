import express      from 'express'; 
import fs from 'fs/promises';  
import log from '@ajar/marker';
import path, { dirname } from "path";
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DB_FILE_PATH = path.resolve(__dirname, "../data/users.json")
const LOG_FILE_PATH = path.resolve(__dirname, "../logs/http.log")

//midlleware usage
const router = express.Router();

router.use(express.json);
router.use(readFromFile);

//middleware functions
async function readFromFile(req, res, next){
    try{
        log.magenta('start reading...');
        const data = await fs.readFile(DB_FILE_PATH, 'utf8');
        log.cyan('FIle loaded!, Contents:',data)
        req.users = JSON.parse(data) || []
        next()
    }catch(error){
        log.error(error);
        next(error)
    }
}

async function logger(req, res, next){
    await fs.appendFile(LOG_FILE_PATH, `${req.method} ${req.path} ${Date.now()} \n `);
    next()
}

//helpers
async function writeToFile(users){
    log.magenta('start writing...');
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(users, null, 2));
    log.cyan('FIle loaded!, Contents:',data)
}

function randomId(){
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
}

//create new user
router.post('/', async (req, res, next) => {
    try{
        const user = {...req.body, id: randomId()}
        req.users.push(user)
        await writeToFile(req.users)
        res.status(200).send('new user created')
    }
    catch (err) {
        next(err)
    }
})

//get all users
router.get('/', async (req, res) => {
    res.status(200).send(req.users)
})

//get user by ID
router.get('/:id', async (req, res) => {
    const user = req.users.find((u) => u.id == req.params.id);
    if (!user) {
        res.status(404).json( {status: "user not found" })
    } else {
        res.status(200).json(user);
    }
})

//update user
router.put("/:id", async (req, res, next) => {
    try {
        const userIndex = req.users.findIndex((u) => u.id == req.params.id);
        if (userIndex == -1) {
            return res
                .status(404)
                .json({ status: `user with id ${req.params.id} not found`})
        }
        const user = {...req.users[userIndex], ...req.body }
        req.users[userIndex] = user
        await writeToFile(req.users)
        res.status(200).json( { status: 'user updated', user })
    }
    catch (err) {
        next(err)
    }
    
})

//delete user
router.delete("/:id", async (req, res, next) => {
    try {
        const len = req.users.length;
        req.users = req.users.filter((u) => u.id !== req.params.id);

        if (len > req.users.length) {
            await writeToFile(req.users)
            res.status(200).json( { status: 'user deleted', user })
        } else {
            res
                .status(404)
                .json({ status: `user with id ${req.params.id} not found`})
        }
        
    }
    catch (err) {
        next(err)
    }
})


export default router

