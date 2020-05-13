import e, {Request, Response, NextFunction} from 'express';

export const authReimbursementMiddleware = (req : Request, res : Response, next : NextFunction) => {
    //check end url - any extending urls only allow GET
    if(req.url === '/reimbursements' || req.url === '/reimbursements/'){
        //post is allowed for all, patch is allowed for finance-manager
        if(req.method === 'POST'){
            next();
        }
        else if(req.method === 'PATCH'){
            if(!req.session || !req.session.user){
                res.status(401).send('The incoming token has expired');
            }
            else if(req.session.user.role !== 'finance-manager'){
                res.status(401).send('The incoming token has expired');
            }
            else {
                next();
            }
        }
        else{
            res.status(401).send('The incoming token has expired');
        }
    }
    else if(req.method === 'GET'){
        next();
    }
    else{
        res.status(401).send('The incoming token has expired');
    }
};

export const authReimbursementStatusMiddleware = (req : Request, res : Response, next : NextFunction) => {
    //only finance-manager allowed for /status/:statusId
    if(!req.session || !req.session.user){
        res.status(401).send('The incoming token has expired');
    }
    else if(req.session.user.role !== 'finance-manager'){
        res.status(401).send('The incoming token has expired');
    }
    else {
        next();
    }
};

export const authReimbursementAuthorMiddleware = (req : Request, res : Response, next : NextFunction) => {
    //only finance-manager and matching users can access /users/:userId
    if(req.method === 'GET'){
        if(!req.session || !req.session.user){
            res.status(401).send('The incoming token has expired');
        }
        else if(req.session.user.role !== 'finance-manager' && req.session.user.userId !== req.params.userId){
            res.status(401).send('The incoming token has expired');
        }
        else {
            next();
        }
    }
    else{
        res.status(401).send('The incoming token has expired');
    }
};





export const authUserMiddleware = (req : Request, res : Response, next : NextFunction) => {
    //check endpoint - /users can have patch or get endpoints
    if(req.url === '/users' || req.url === '/users/'){
        if(req.method === 'PATCH'){
            //only allow admin
            if(!req.session || !req.session.user){
                res.status(401).send('The incoming token has expired');
            }
            else if(req.session.user.role !== 'admin'){
                res.status(401).send('The incoming token has expired');
            }
            else {
                next();
            }
        }
        else if(req.method === 'GET'){
            //only allow finance manager
            if(!req.session || !req.session.user){
                res.status(401).send('The incoming token has expired');
            }
            else if(req.session.user.role !== 'finance-manager'){
                res.status(401).send('The incoming token has expired');
            }
            else {
                next();
            }
        }
        else{
            res.status(401).send('The incoming token has expired');
        }
    }
    else {
        //endpoint is for a specific user - allow finance manager or a user with matching id
        if(req.method === 'GET'){
            if(!req.session || !req.session.user){
                res.status(401).send('The incoming token has expired');
            }
            else if(req.session.user.role !== 'finance-manager' && req.session.user.userId !== req.params.userId){
                res.status(401).send('The incoming token has expired');
            }
            else{
                next();
            }
        }
        else{
            res.status(401).send('The incoming token has expired');
        } 
    }
};