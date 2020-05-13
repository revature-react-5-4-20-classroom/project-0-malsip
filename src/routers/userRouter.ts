import express, {Router, Request, Response} from 'express';
import { authUserMiddleware } from '../middleware/authMiddleware';

export const userRouter : Router = express.Router();

userRouter.use(authUserMiddleware);

userRouter.get('/', (req : Request, res : Response) => {
    //return all users from database
})

userRouter.get('/:userId', (req : Request, res : Response) => {
    const id = +req.params.userId;
    if(isNaN(id)){
        res.sendStatus(400).send('No matching id in Database');
    }
    else{
        //return user information
    }
})

userRouter.patch('/', (req : Request, res : Response) => {
    //user must exist and all data is present to update - undefined fields will not be updated
    //respond with modified user data
});