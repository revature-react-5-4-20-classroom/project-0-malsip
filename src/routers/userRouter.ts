import express, {Router, Request, Response} from 'express';

export const userRouter : Router = express.Router();

userRouter.get('/', (req : Request, res : Response) => {
    //verify role finance-manager
    //return all users from database
})

userRouter.get('/:userId', (req : Request, res : Response) => {
    const id = +req.params.userId;
    if(isNaN(id)){
        res.sendStatus(400).send('No matching id in Database');
    }
    else{
        //verify role of user is finance-manager or user has id matching the accessed user
        //return user information
    }
})

userRouter.patch('/', (req : Request, res : Response) => {
    //allowed role is admin
    //user must exist and all data is present to update - undefined fields will not be updated
    //respond with modified user data
});