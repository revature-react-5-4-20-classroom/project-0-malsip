import express, {Router, Request, Response} from 'express';
import { authUserMiddleware, authUserIdMiddleware } from '../middleware/authMiddleware';
import { queryMachine, updateTable } from '../index';

export const userRouter : Router = express.Router();

userRouter.use(authUserMiddleware);
userRouter.use('/:userId', authUserIdMiddleware);

userRouter.get('/', async(req : Request, res : Response) => {
    //return all users from database
    try{
        let result = await queryMachine('SELECT * FROM users');
        res.json(result.rows);
    }
    catch(e){
        throw new Error(e.message);
    }
})

userRouter.get('/:userId', async (req : Request, res : Response) => {
    const id = +req.params.userId;
    if(isNaN(id)){
        res.sendStatus(400).send('No matching id in Database');
    }
    else{
        //return user information
        try{
            let result = await queryMachine(`SELECT * FROM users WHERE userid = ${id}`);
            res.json(result.rows);
        }
        catch(e){
            throw new Error(e.message);
        }
    }
})
//TODO
userRouter.patch('/', async (req : Request, res : Response) => {
    //user must exist and all data is present to update - undefined fields will not be updated
    let {userId, username, password, firstname, lastname, email, role} = req.body;
    if(typeof(userId) == 'number'){
        //check valid id
        try{
            let result = await queryMachine(`SELECT * FROM users WHERE userid = ${userId}`);
            if(typeof(result.rows[0]) == 'undefined'){
                res.status(400).send('Incorrect input. Pass a valid ID.');
            }
        }
        catch(e){
            throw new Error(e.message);
        }
        
        //check each variable - if valid, run an update for the new value
        try{
            await updateTable('users', 'userid', userId, 'username', username, 'string');
            await updateTable('users', 'userid', userId, 'password', password, 'string');
            await updateTable('users', 'userid', userId, 'firstname', firstname, 'string');
            await updateTable('users', 'userid', userId, 'lastname', lastname, 'string');
            await updateTable('users', 'userid', userId, 'email', email, 'string');
            await updateTable('users', 'userid', userId, 'role', role, 'number');
        }
        catch(e){
            throw new Error(e.message);
        }

        //respond with updated data
        try{
            let result = await queryMachine(`SELECT * FROM users WHERE userid = ${userId}`);
            res.json(result.rows);
        }
        catch(e){
            throw new Error(e.message);
        }
    }
    else{
        res.status(400).send('Incorrect input. Pass a valid numerical ID as userId');
    }
});