import express, {Router, Request, Response} from 'express';
import { authReimbursementAuthorMiddleware, authReimbursementStatusMiddleware, authReimbursementMiddleware } from '../middleware/authMiddleware';

export const reimbursementRouter : Router = express.Router();

reimbursementRouter.use('/', authReimbursementMiddleware);
reimbursementRouter.use('/status/:statusId', authReimbursementStatusMiddleware);
reimbursementRouter.use('/author/userId/:userId', authReimbursementAuthorMiddleware);

reimbursementRouter.get('/status/:statusId', (req : Request, res : Response) => {
    const statusId = +req.params.statusId;
    if(isNaN(statusId)){
        res.sendStatus(400).send('Status Id must be numeric');
    }
    else {
        //return status with correct id
    }
})

reimbursementRouter.get('/author/userId/:userId', (req : Request, res : Response) => {
    const userId = +req.params.userId;
    if(isNaN(userId)){
        res.sendStatus(400).send('User Id must be numeric');
    }
    else {
        //return reimbursement with authorid matching userid
    }
})

reimbursementRouter.post('/', (req : Request, res : Response) => {
    let {reimbursementId, author, amount, dateSubmitted, dateResolved, description, resolver, status, type} = req.body;

    //resolver and type can be left empty
    if((typeof(reimbursementId) == 'number' && reimbursementId === 0) && typeof(author) == 'number' && typeof(amount) == 'number' && typeof(dateSubmitted) == 'number' && typeof(dateResolved) == 'number' && typeof(description) == 'string' && (typeof(resolver) == 'number' || typeof(resolver) == 'undefined') && typeof(status) == 'number' && (typeof(type) == 'number' || typeof(type) == 'undefined')){
        //add reimbursement to database

        res.sendStatus(201);
    }
    else{
        res.status(400).send('Incorrect Reimbursement input. Re-check arguments and their types. ReimbursementId must be passed as 0.');
    }
})

reimbursementRouter.patch('/', (req : Request, res : Response) => {
    //require reimbursementId and all updated fields, any undefined fields will remain unchanged
    //respond with updated data
})