import express, { Application, Request, Response } from 'express';
import bodyparser from 'body-parser';
import { Pool, QueryResult } from 'pg';
import User from './models/Users';
import { userRouter } from './routers/userRouter';
import { reimbursementRouter } from './routers/reimbursementRouter';
import { sessionMiddleware } from './middleware/sessionMiddleware';
import { PoolClient } from 'pg';
import { verifyPassword, hashStoredPasswords } from './hashware/passwordHash';
import { createUnsecuredToken } from 'jsontokens'


//create dependent variables for connections
const port : number = 3000;

//start express
const app : Application = express();
export const connectionPool : Pool = new Pool({
    user: process.env['PG_USER'],
    host: process.env['PG_HOST'],
    database: process.env['PG_DATABASE'],
    password: process.env['PG_PASSWORD'],
    port: 5432
});

//call middleware
app.use(bodyparser.json());
app.use(sessionMiddleware);

//endpoints
app.post('/login', async (req : Request, res : Response) => {
    const {username, password} = req.body;
    if(typeof(username) === 'string' && typeof(password) === 'string'){
        try{
            let login = await loginUser(username, password);
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

app.use('/hash-passwords', (req : Request, res : Response) => {
    hashStoredPasswords(res);
    res.status(200).send('Passwords successfully hashed.');
});

app.use('/users', userRouter);

app.use('/reimbursements', reimbursementRouter);

//listener - start database
app.listen(port, () => {
    console.log(`App has started - listening on port ${port}\nConnecting to database...`);
    console.log(`${process.env['PG_USER']}, ${process.env['PG_HOST']}, ${process.env['PG_DATABASE']}, ${process.env['PG_PASSWORD']}`);
    connectionPool.connect().then(() => {console.log('Connected!')});
    console.log(connectionPool.query("SELECT * FROM users"));
});


//will return a User from the DB matching the given username and password
async function loginUser(username : string, password : string) : Promise<Object>{
    try{
        let result : QueryResult = await queryMachine(`SELECT * FROM users WHERE username = '${username}'`);
        if(result.rows.length > 0 && typeof(result.rows[0]) != 'undefined'){ 
            if(verifyPassword(password, result.rows[0].password)){
                //create a JWT, return a promise of a JWT instead of an object
                // let payload = {
                //     id : result.rows[0].userId,
                //     role : result.rows[0].role
                // };
                // const token = createUnsecuredToken(payload); 
                // console.log(token);
                // return token;
                return result.rows[0];
            }
            else{
                throw new Error('loginUser: invalid password');
            }
        }
        else {
            throw new Error('loginUser: Could not find user.');
        }
    }
    catch(e){
        throw new Error('loginUser: Could not find user.');
    }
}

export async function convertRoleIdToRole(roleId : number) : Promise<string>{
    try{
        let result : QueryResult = await queryMachine(`SELECT role FROM role WHERE roleId = '${roleId}'`);
        if(result.rows.length > 0 && typeof(result.rows[0]) != 'undefined'){          
            return result.rows[0].role;
        }
        else {
            throw new Error('could not match role');
        }
    }
    catch(e){
        throw new Error('could not match role');
    }
}

export async function queryMachine(query : string) : Promise<QueryResult>{
    let client : PoolClient = await connectionPool.connect();
    try{
        let result = await connectionPool.query(query);
        
        return result; 
    }
    catch(e){
        throw new Error(e.message);
    }
    finally{
        client && client.release();
    }
}

export async function updateTable(table : string, rowSetter : string, rowId : number, column : string, value : any, type : string, ){
    if(typeof(value) == type){
        try{
            if(type == 'number'){
                await queryMachine(`UPDATE ${table} SET ${column} = ${value} WHERE ${rowSetter} = ${rowId}`);
            }
            else {
                await queryMachine(`UPDATE ${table} SET ${column} = '${value}' WHERE ${rowSetter} = ${rowId}`);
            }
            console.log(`Successful Update on ${table} setting ${column} to ${value}`);
        }
        catch(e){
            console.log(`Failed Update on ${table} setting ${column} to ${value}`);
            throw new Error(e.message);
        }
    }
    else{
        console.log(`Did not update on ${table} setting ${column} to ${value}`);
    }
}

export async function submitReceipt(userId : number, query : string){

}

//optional implentations
// - ask about where to store JWT and encryption
// - ask about what it means to submit a receipt