import e, {Request, Response, NextFunction} from 'express';

export const authReimbursementMiddleware = (req : Request, res : Response, next : NextFunction) => {
    console.log('authReimbursementMiddleware');
    //check end url - any extending urls only allow GET
    if(req.url === '/'){
        console.log('/reimbursements');
        //post is allowed for all, patch is allowed for finance-manager
        if(req.method === 'POST'){
            console.log('POST');
            next();
        }
        else if(req.method === 'PATCH'){
            console.log('PATCH');
            if(!req.session || !req.session.user){
                console.log('No session or not logged in');
                res.status(401).send('The incoming token has expired');
            }
            else if(req.session.user.role !== 'finance-manager'){
                console.log('Not a finance-manager or proper user');
                res.status(401).send('The incoming token has expired');
            }
            else {
                next();
            }
        }
        else{
            console.log('No appropriate method called');
            res.status(401).send('The incoming token has expired');
        }
    }
    else if(req.method === 'GET'){
        console.log('GET');
        next();
    }
    else{
        console.log('No appropriate method called');
        res.status(401).send('The incoming token has expired');
    }
};

export const authReimbursementStatusMiddleware = (req : Request, res : Response, next : NextFunction) => {
    console.log('authReimbursementStatusMiddleware');
    //only finance-manager allowed for /status/:statusId
    if(!req.session || !req.session.user){
        console.log('No session or not logged in');
        res.status(401).send('The incoming token has expired');
    }
    else if(req.session.user.role !== 'finance-manager'){
        console.log('Not a finance-manager');
        res.status(401).send('The incoming token has expired');
    }
    else {
        next();
    }
};

export const authReimbursementAuthorMiddleware = (req : Request, res : Response, next : NextFunction) => {
    console.log('authReimbursementAuthorMiddleware');
    //only finance-manager and matching users can access /users/:userId
    if(req.method === 'GET'){
        console.log('GET');
        if(!req.session || !req.session.user){
            console.log('No session or not logged in');
            res.status(401).send('The incoming token has expired');
        }
        else if(req.session.user.role !== 'finance-manager' && req.session.user.userId !== req.params.userId){
            console.log('Not a finance-manager or proper user');
            res.status(401).send('The incoming token has expired');
        }
        else {
            next();
        }
    }
    else{
        console.log('No appropriate method called');
        res.status(401).send('The incoming token has expired');
    }
};





export const authUserMiddleware = (req : Request, res : Response, next : NextFunction) => {
    //check endpoint - /users can have patch or get endpoints
    console.log('authUserMiddleware');
    if(req.url === '/'){
        console.log('/users');
        if(req.method === 'PATCH'){
            console.log('PATCH');
            //only allow admin
            if(!req.session || !req.session.user){
                console.log('No session or not logged in');
                res.status(401).send('The incoming token has expired');
            }
            else if(req.session.user.role !== 'admin'){
                console.log('Not an admin');
                res.status(401).send('The incoming token has expired');
            }
            else {
                next();
            }
        }
        else if(req.method === 'GET'){
            console.log('GET');
            //only allow finance manager
            if(!req.session || !req.session.user){
                console.log('No session or not logged in');
                res.status(401).send('The incoming token has expired');
            }
            else if(req.session.user.role !== 'finance-manager'){
                console.log(req.session.user);
                console.log('Not a finance-manager');
                res.status(401).send('The incoming token has expired');
            }
            else {
                next();
            }
        }
        else{
            console.log('No appropriate method called');
            res.status(401).send('The incoming token has expired');
        }
    }
    else {
        next();
    }
};

export const authUserIdMiddleware = (req : Request, res : Response, next : NextFunction) => {
    console.log('/users/:id');
    //endpoint is for a specific user - allow finance manager or a user with matching id
    if(req.method === 'GET'){
        console.log('GET');
        if(!req.session || !req.session.user){
            console.log('No session or not logged in');
            res.status(401).send('The incoming token has expired');
        }
        else if(req.session.user.role !== 'finance-manager' && req.session.user.userId != req.params.userId){
            console.log('Not a finance-manager or proper user');
            res.status(401).send('The incoming token has expired');
        }
        else{
            next();
        }
    }
    else{
        console.log('No appropriate method called');
        res.status(401).send('The incoming token has expired');
    } 
};