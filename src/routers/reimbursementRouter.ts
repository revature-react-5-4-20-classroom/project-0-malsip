import express, {Router, Request, Response} from 'express';
import { authReimbursementAuthorMiddleware, authReimbursementStatusMiddleware, authReimbursementMiddleware } from '../middleware/authMiddleware';
import { queryMachine, updateTable } from '../index';

export const reimbursementRouter : Router = express.Router();

reimbursementRouter.use('/', authReimbursementMiddleware);
reimbursementRouter.use('/status/:statusId', authReimbursementStatusMiddleware);
reimbursementRouter.use('/author/userId/:userId', authReimbursementAuthorMiddleware);

reimbursementRouter.get('/status/:statusId', async(req : Request, res : Response) => {
    const statusId = +req.params.statusId;
    if(isNaN(statusId)){
        res.sendStatus(400).send('Status Id must be numeric');
    }
    else {
        //return status with correct id
        try{
            let result = await queryMachine(`SELECT * FROM reimbursement WHERE status = ${statusId} ORDER BY datesubmitted`);
            res.json(result.rows);
        }
        catch(e){
            throw new Error(e.message);
        }
    }
})

reimbursementRouter.get('/author/userId/:userId', async (req : Request, res : Response) => {
    const userId = +req.params.userId;
    if(isNaN(userId)){
        res.sendStatus(400).send('User Id must be numeric');
    }
    else {
        //return reimbursement with authorid matching userid
        try{
            let result = await queryMachine(`SELECT * FROM reimbursement WHERE author = ${userId} ORDER BY datesubmitted`);
            res.json(result.rows);
        }
        catch(e){
            throw new Error(e.message);
        }
    }
})

reimbursementRouter.post('/', async (req : Request, res : Response) => {
    let {reimbursementId, author, amount, dateSubmitted, dateResolved, description, resolver, status, type} = req.body;

    //resolver and type can be left empty
    if((typeof(reimbursementId) == 'number' && reimbursementId === 0) && typeof(author) == 'number' && typeof(amount) == 'number' && typeof(dateSubmitted) == 'number' && typeof(dateResolved) == 'number' && typeof(description) == 'string' && (typeof(resolver) == 'number' || typeof(resolver) == 'undefined') && typeof(status) == 'number' && (typeof(type) == 'number' || typeof(type) == 'undefined')){
        //add reimbursement to database
        try{
            if(typeof(resolver) == 'undefined'){
                resolver = 'NULL';
            }
            if(typeof(type) == 'undefined'){
                type = 'NULL';
            }
            console.log(`INSERT INTO reimbursement values(DEFAULT, ${author}, ${amount}, ${dateSubmitted}, ${dateResolved}, ${description}, ${resolver}, ${status}, ${type})`);
            let result = await queryMachine(`INSERT INTO reimbursement values(DEFAULT, ${author}, ${amount}, ${dateSubmitted}, ${dateResolved}, '${description}', ${resolver}, ${status}, ${type})`);
        }
        catch(e){
            throw new Error(e.message);
        }
        res.sendStatus(201);
    }
    else{
        res.status(400).send('Incorrect Reimbursement input. Re-check arguments and their types. ReimbursementId must be passed as 0.');
    }
})
//TODO
reimbursementRouter.patch('/', async(req : Request, res : Response) => {
    //require reimbursementId and all updated fields, any undefined fields will remain unchanged
    let {reimbursementId, author, amount, dateSubmitted, dateResolved, description, resolver, status, type} = req.body;
    if(typeof(reimbursementId) == 'number'){
        //check valid id
        try{
            let result = await queryMachine(`SELECT * FROM reimbursement WHERE reimbursementid = ${reimbursementId}`);
            if(typeof(result.rows[0]) == 'undefined'){
                res.status(400).send('Incorrect input. Pass a valid ID.');
            }
        }
        catch(e){
            throw new Error(e.message);
        }
        
        //check each variable - if valid, run an update for the new value
        try{
            await updateTable('reimbursement', 'reimbursementId', reimbursementId, 'author', author, 'number');
            await updateTable('reimbursement', 'reimbursementId', reimbursementId, 'amount', amount, 'number');
            await updateTable('reimbursement', 'reimbursementId', reimbursementId, 'dateSubmitted', dateSubmitted, 'number');
            await updateTable('reimbursement', 'reimbursementId', reimbursementId, 'dateResolved', dateResolved, 'number');
            await updateTable('reimbursement', 'reimbursementId', reimbursementId, 'description', description, 'string');
            await updateTable('reimbursement', 'reimbursementId', reimbursementId, 'resolver', resolver, 'number');
            await updateTable('reimbursement', 'reimbursementId', reimbursementId, 'status', status, 'number');
            await updateTable('reimbursement', 'reimbursementId', reimbursementId, 'type', type, 'number');
        }
        catch(e){
            throw new Error(e.message);
        }

        //respond with updated data
        try{
            let result = await queryMachine(`SELECT * FROM reimbursement WHERE reimbursementid = ${reimbursementId}`);
            res.json(result.rows);
        }
        catch(e){
            throw new Error(e.message);
        }
    }
    else{
        res.status(400).send('Incorrect input. Pass a valid numerical ID as reimbursementId.');
    }
})


