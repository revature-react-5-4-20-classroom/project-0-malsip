import express, { Application, Request, Response } from 'express';
import bodyparser from 'body-parser';
import { Pool, QueryResult } from 'pg';
import { userRouter } from './routers/userRouter';
import { reimbursementRouter } from './routers/reimbursementRouter';
import { sessionMiddleware } from './middleware/sessionMiddleware';
import { PoolClient } from 'pg';
import { verifyPassword, hashStoredPasswords } from './hashware/passwordHash';
import { createUnsecuredToken } from 'jsontokens';
import { corsAccessMiddleware} from './middleware/corsAccessMiddleware';
import { refreshDatabase } from './refreshDatabase';


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
app.use(corsAccessMiddleware);
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
                req.session.user.role = await convertRoleIdToRole(req.session.user.role);
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

// app.use('/hash-passwords', (req : Request, res : Response) => {
//     hashStoredPasswords(res);
//     res.status(200).send('Passwords successfully hashed.');
// });

app.use('/refreshDatabase', async (req : Request, res : Response) => {
    //refresh all tables to default values
    await refreshDatabase();

    //hash the passwords
    await hashStoredPasswords(res);


    res.status(200).send('Successfully refreshed');
});

app.use('/credentials', async (req: Request, res: Response) => { 
    res.json(req.session?.user);
});

app.use('/logout', (req: Request, res: Response) => {
    if (req.session && req.session.user){
        req.session.user = null;
        res.status(200).send('Logged out successfully');
    }
    else{
        res.status(400).send('Not logged in');
    }
});

app.use('/users', userRouter);

app.use('/reimbursements', reimbursementRouter);

//listener - start database
app.listen(port, () => {
    console.log(`App has started - listening on port ${port}\nConnecting to database...`);
    connectionPool.connect().then(() => {console.log('Connected!')});
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

export async function convertRoleToRoleId(role : string) : Promise<number>{
    try{
        let result : QueryResult = await queryMachine(`SELECT roleId FROM role WHERE role = '${role}'`);
        if(result.rows.length > 0 && typeof(result.rows[0]) != 'undefined'){          
            return result.rows[0].roleId;
        }
        else {
            throw new Error('could not match role');
        }
    }
    catch(e){
        throw new Error('could not match role');
    }
}

export async function convertStatusIdToStatus(statusId : number) : Promise<string>{
    try{
        let result : QueryResult = await queryMachine(`SELECT status FROM reimbursementstatus WHERE statusid = '${statusId}'`);
        if(result.rows.length > 0 && typeof(result.rows[0]) != 'undefined'){          
            return result.rows[0].status;
        }
        else {
            throw new Error('could not match status');
        }
    }
    catch(e){
        throw new Error('could not match status');
    }
}

export async function convertStatusToStatusId(status : string) : Promise<number>{
    try{
        let result : QueryResult = await queryMachine(`SELECT statusId FROM reimbursementstatus WHERE status = '${status}'`);
        if(result.rows.length > 0 && typeof(result.rows[0]) != 'undefined'){          
            return result.rows[0].roleId;
        }
        else {
            throw new Error('could not match status');
        }
    }
    catch(e){
        throw new Error('could not match status');
    }
}

export async function convertTypeIdToType(typeId : number) : Promise<string>{
    try{
        let result : QueryResult = await queryMachine(`SELECT type FROM reimbursementtype WHERE typeid = '${typeId}'`);
        if(result.rows.length > 0 && typeof(result.rows[0]) != 'undefined'){          
            return result.rows[0].type;
        }
        else {
            throw new Error('could not match type');
        }
    }
    catch(e){
        throw new Error('could not match type');
    }
}

export async function convertTypeToTypeId(type : string) : Promise<number>{
    try{
        let result : QueryResult = await queryMachine(`SELECT typeId FROM reimbursementtype WHERE type = '${type}'`);
        if(result.rows.length > 0 && typeof(result.rows[0]) != 'undefined'){          
            return result.rows[0].roleId;
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
// - ask about what it means to submit a receipt - just who does what?

