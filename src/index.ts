import express, {Application, Request, Response, NextFunction } from 'express';
import bodyparser from 'body-parser';
import {User, Role, Reimbursement, ReimbursementStatus, ReimbursementType, Expired} from './models/Models';
import {userRouter} from './routers/userRouter';
import {reimbursementRouter} from './routers/reimbursementRouter';
import {sessionMiddleware} from './middleware/sessionMiddleware';

const portNum : number = 3000;

//start express, parse incoming as json
const app : Application = express();
app.use(bodyparser.json());
app.use(sessionMiddleware);

//connect to db
// const pgp = require('pg-promise');
// const cn = "postgres://malsip:l0fh34ty@mark-alsip-project-zero.cab3p8px90sp.us-east-2.rds.amazonaws.com:5432/P0Data";
// //let dbConn = pg.Client(dbConnectionEndpoint);
// //dbConn.connect();
// // const cn = {
// //     host: 'mark-alsip-project-zero.cab3p8px90sp.us-east-2.rds.amazonaws.com',
// //     port: '5432',
// //     database: 'P0Data',
// //     user: 'malsip',
// //     password: 'l0fh34ty'
// // };
// const db = pgp(cn);

// db.one(`select * from users`);


// {
//     host: 'malsip',
//     password: 'l0fh34ty'
// }

//security handled here?
app.use((req : Request, res : Response, next: NextFunction) => {
    if (false /*session storage has invalid access*/){
        res.sendStatus(401);
        res.json(new Expired());
    }
    next();
});

app.post('/login', (req : Request, res : Response) => {
    const {username, password} = req.body;
    if(typeof(username) === 'string' && typeof(password) === 'string'){
        try{
            let login = loginUser(username, password);
            if(req.session){
                req.session.user = login;
                res.json(login);
            }
            else{
                res.status(400).send('No session');
            }
        }
        catch(e){
            console.log(e.message);
            res.status(400).send('Invalid Credentials');
        }
    }
    else {
        res.status(400).send('Input Username and Password must both be entered and must be strings.');
    }
})

app.use('/users', userRouter);

app.use('/reimbursements', reimbursementRouter);

app.listen(portNum, () => {
    console.log(`App has started - listening on port ${portNum}`);
});


//will return a User from the DB matching the given username and password
function loginUser(username : string, password : string) : void{
    
}



//optional implentations
// - hash stored passwords
// - paging and sorting endpoints
// - use json web tokens instead of session storage
// - be able to submit receipt. what does this mean?