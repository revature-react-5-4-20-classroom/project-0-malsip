import express, { Router, Request, Response } from 'express';
import { authReimbursementAuthorMiddleware, authReimbursementStatusMiddleware, authReimbursementMiddleware } from '../middleware/authMiddleware';
import { queryMachine, updateTable, convertStatusIdToStatus, convertTypeIdToType } from '../index';
import { QueryResult } from 'pg';

export const reimbursementRouter : Router = express.Router();

reimbursementRouter.use('/', authReimbursementMiddleware);
reimbursementRouter.use('/status/:statusId', authReimbursementStatusMiddleware);
reimbursementRouter.use('/author/userId/:userId', authReimbursementAuthorMiddleware);

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
            let query : string = `SELECT * FROM reimbursement WHERE status = ${statusId}`
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
            await result.rows.forEach(async (element)=>{
                element.status = await convertStatusIdToStatus(element.status);
                element.type = await convertTypeIdToType(element.type);
            });

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
            let query : string = `SELECT * FROM reimbursement WHERE author = ${userId}`
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
            await result.rows.forEach(async (element)=>{
                element.status = await convertStatusIdToStatus(element.status);
                element.type = await convertTypeIdToType(element.type);
            });

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
    if((typeof(reimbursementId) == 'number' && reimbursementId === 0) && (req.session && req.session.user) && typeof(amount) == 'number' && typeof(dateSubmitted) == 'number' && typeof(dateResolved) == 'number' && typeof(description) == 'string' && (typeof(resolver) == 'number' || typeof(resolver) == 'undefined') && typeof(status) == 'number' && (typeof(type) == 'number' || typeof(type) == 'undefined')){
        //add reimbursement to database
        try{
            if(typeof(resolver) == 'undefined'){
                resolver = 'NULL';
            }
            if(typeof(type) == 'undefined'){
                type = 'NULL';
            }
            console.log(`INSERT INTO reimbursement values(DEFAULT, ${req.session.user.userId}, ${amount}, ${dateSubmitted}, ${dateResolved}, ${description}, ${resolver}, ${status}, ${type})`);
            let result = await queryMachine(`INSERT INTO reimbursement values(DEFAULT, ${req.session.user.userId}, ${amount}, ${dateSubmitted}, ${dateResolved}, '${description}', ${resolver}, ${status}, ${type})`);
        }
        catch(e){
            throw new Error(e.message);
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


