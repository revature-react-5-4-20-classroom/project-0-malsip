import express, { Router, Request, Response } from 'express';
import { authReimbursementAuthorMiddleware, authReimbursementStatusMiddleware, authReimbursementMiddleware } from '../middleware/authMiddleware';
import { queryMachine, updateTable, convertStatusToStatusId, convertTypeToTypeId } from '../index';
import { QueryResult } from 'pg';

export const reimbursementRouter : Router = express.Router();

reimbursementRouter.use('/', authReimbursementMiddleware);
reimbursementRouter.use('/status/:statusId', authReimbursementStatusMiddleware);
reimbursementRouter.use('/author/userId/:userId', authReimbursementAuthorMiddleware);

reimbursementRouter.get('/', async(req : Request, res : Response) => {
    //return all reimbursements from database
    try{
        let result = await queryMachine(`SELECT reimbursementid, users.username as "author", amount, datesubmitted, dateresolved, description, resolvertable.username as "resolver", reimbursementstatus.status, reimbursementtype.type FROM (((reimbursement JOIN reimbursementstatus ON reimbursement.status = statusid) LEFT JOIN reimbursementtype ON reimbursement.type = typeid) JOIN users ON reimbursement.author = users.userid) LEFT JOIN users as resolvertable ON reimbursement.resolver = resolvertable.userid`);
        res.json(result.rows);
    }
    catch(e){
        throw new Error(e.message);
    }
});

reimbursementRouter.get('/status/:statusId*', async(req : Request, res : Response) => {
    const statusId = +req.params.statusId;

    let startDate;
    if(typeof(req.query.start) != 'undefined'){
        startDate = +req.query.start;
        if(isNaN(startDate)){
            res.status(400).send('Start Date must be numeric');
            return;
        }
    }
    let endDate;
    if(typeof(req.query.end) != 'undefined'){
        endDate = +req.query.end;
        if(isNaN(endDate)){
            res.status(400).send('End Date must be numeric');
            return;
        }
    }

    let limit = 0;
    let offset = 0;
    if(typeof(req.query.limit) != 'undefined'){
        limit = +req.query.limit;
        if(isNaN(limit)){
            res.status(400).send('Limit must be numeric');
            return;
        }
        if(typeof(req.query.offset) != 'undefined'){
            offset = +req.query.offset;
            if(isNaN(offset)){
                res.status(400).send('Offset Id must be numeric');
                return;
            }
        }
    }

    if(isNaN(statusId)){
        res.sendStatus(400).send('Status Id must be numeric');
    }
    else {
        //return status with correct id
        try{
            let query : string = `SELECT reimbursementid, users.username as "author", amount, datesubmitted, dateresolved, description, resolvertable.username as "resolver", reimbursementstatus.status, reimbursementtype.type FROM (((reimbursement JOIN reimbursementstatus ON reimbursement.status = statusid) LEFT JOIN reimbursementtype ON reimbursement.type = typeid) JOIN users ON reimbursement.author = users.userid) JOIN users as resolvertable ON reimbursement.resolver = resolvertable.userid WHERE status = ${statusId}`
            if(typeof(req.query.start) != 'undefined'){
                query += ` and dateSubmitted = ${startDate}`;
            }
            if(typeof(req.query.end) != 'undefined'){
                query += ` and dateResolved = ${endDate}`;
            }
            query += ` ORDER BY datesubmitted`;
            if(limit !== 0){
                query += ` LIMIT ${limit} OFFSET ${offset}`;
            }

            let result = await queryMachine(query);

            res.json(result.rows);
        }
        catch(e){
            throw new Error(e.message);
        }
    }
})

reimbursementRouter.get('/author/userId/:userId*', async (req : Request, res : Response) => {
    const userId = +req.params.userId;

    let startDate;
    if(typeof(req.query.start) != 'undefined'){
        startDate = +req.query.start;
        if(isNaN(startDate)){
            res.status(400).send('Start Date must be numeric');
            return;
        }
    }
    let endDate;
    if(typeof(req.query.end) != 'undefined'){
        endDate = +req.query.end;
        if(isNaN(endDate)){
            res.status(400).send('End Date must be numeric');
            return;
        }
    }

    let limit = 0;
    let offset = 0;
    if(typeof(req.query.limit) != 'undefined'){
        limit = +req.query.limit;
        if(isNaN(limit)){
            res.status(400).send('Limit must be numeric');
            return;
        }
        if(typeof(req.query.offset) != 'undefined'){
            offset = +req.query.offset;
            if(isNaN(offset)){
                res.status(400).send('Offset Id must be numeric');
                return;
            }
        }
    }

    if(isNaN(userId)){
        res.sendStatus(400).send('User Id must be numeric');
    }
    else {
        //return with correct user id as author
        try{
            let query : string = `SELECT reimbursementid, users.username as "author", amount, datesubmitted, dateresolved, description, resolvertable.username as "resolver", reimbursementstatus.status, reimbursementtype.type FROM (((reimbursement JOIN reimbursementstatus ON reimbursement.status = statusid) LEFT JOIN reimbursementtype ON reimbursement.type = typeid) JOIN users ON reimbursement.author = users.userid) JOIN users as resolvertable ON reimbursement.resolver = resolvertable.userid WHERE author = ${userId}`
            if(typeof(req.query.start) != 'undefined'){
                query += ` and dateSubmitted = ${startDate}`;
            }
            if(typeof(req.query.end) != 'undefined'){
                query += ` and dateResolved = ${endDate}`;
            }
            query += ` ORDER BY datesubmitted`;
            if(limit !== 0){
                query += ` LIMIT ${limit} OFFSET ${offset}`;
            }

            let result = await queryMachine(query);

            res.json(result.rows);
        }
        catch(e){
            throw new Error(e.message);
        }
    }
})


reimbursementRouter.post('/', async (req : Request, res : Response) => {
    let {reimbursementId, amount, dateSubmitted, dateResolved, description, resolver, status, type} = req.body;

    //resolver and type can be left empty
    if((typeof(reimbursementId) == 'number' && reimbursementId === 0) && (req.session && req.session.user) && typeof(amount) == 'number' && typeof(dateSubmitted) == 'number' && typeof(dateResolved) == 'number' && typeof(description) == 'string' && (typeof(resolver) == 'number' || typeof(resolver) == 'undefined') && (typeof(status) == 'number' || typeof(status) == 'string') && (typeof(type) == 'number' || typeof(type) == 'string' || typeof(type) == 'undefined')){
        //add reimbursement to database
        try{
            if(typeof(resolver) == 'undefined'){
                resolver = 'NULL';
            }
            if(typeof(status) == 'string'){
                status = await convertStatusToStatusId(status);
            }
            if(typeof(type) == 'string'){
                type = await convertTypeToTypeId(type);
            }
            if(typeof(type) == 'undefined'){
                type = 'NULL';
            }
            
            

            console.log(`INSERT INTO reimbursement values(DEFAULT, ${req.session.user.userId}, ${amount}, ${dateSubmitted}, ${dateResolved}, ${description}, ${resolver}, ${status}, ${type})`);
            let result = await queryMachine(`INSERT INTO reimbursement values(DEFAULT, ${req.session.user.userId}, ${amount}, ${dateSubmitted}, ${dateResolved}, '${description}', ${resolver}, ${status}, ${type})`);
        }
        catch(e){
            console.log(e.message);
            res.status(400).send('Issues posting...');
        }
        res.sendStatus(201);
    }
    else{
        res.status(400).send('Incorrect Reimbursement input. Re-check arguments and their types. ReimbursementId must be passed as 0. Must be signed in.');
    }
})

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

            if(typeof(status) == 'string'){
                status = await convertStatusToStatusId(status);
            }
            await updateTable('reimbursement', 'reimbursementId', reimbursementId, 'status', status, 'number');
            
            if(typeof(type) == 'string'){
                type = await convertTypeToTypeId(type);
            }
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


