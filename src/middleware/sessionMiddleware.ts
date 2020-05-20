import session from 'express-session';

//default session settings are set here:
const sessionConfig = {
    secret: 'Session Config',
    cookie: {secure:false},
    resave: false,
    saveUninitialized: false
};

export const sessionMiddleware = session(sessionConfig);
