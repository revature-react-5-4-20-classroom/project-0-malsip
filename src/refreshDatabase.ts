import { queryMachine } from ".";

export async function refreshDatabase(){
    //drop tables
    await queryMachine('DROP TABLE IF EXISTS role, reimbursementStatus, reimbursementType, users, reimbursement;');


    //create tables-----------------------------------------------
    await queryMachine(`CREATE TABLE role(
        roleId SERIAL PRIMARY KEY,
        role text NOT NULL UNIQUE
    );`);

    await queryMachine(`CREATE TABLE reimbursementStatus(
        statusId SERIAL PRIMARY KEY,
        status text NOT NULL UNIQUE
    );`);

    await queryMachine(`CREATE TABLE reimbursementType(
        typeId SERIAL PRIMARY KEY,
        type text NOT NULL UNIQUE
    );`);

    await queryMachine(`CREATE TABLE users(
        userId SERIAL PRIMARY KEY,
        username text NOT NULL UNIQUE,
        password text NOT NULL,
        firstName text NOT NULL,
        lastName text NOT NULL,
        email text NOT NULL,
        role int NOT NULL REFERENCES role(roleId)
    );`);

    await queryMachine(`CREATE TABLE reimbursement(
        reimbursementId SERIAL PRIMARY KEY,
        author int NOT NULL REFERENCES users(userId),
        amount int NOT NULL,
        dateSubmitted int NOT NULL,
        dateResolved int NOT NULL,
        description text NOT NULL,
        resolver int REFERENCES users(userId),
        status int NOT NULL REFERENCES reimbursementStatus(statusId),
        type int REFERENCES reimbursementType(typeId)
    );`);


    //insert data-------------------------------------------------
    await queryMachine(`INSERT INTO role(role) values
    ('none'),
    ('admin'),
    ('finance-manager'),
    ('user'),
    ('guest');`);

    await queryMachine(`INSERT INTO reimbursementStatus(status) values
    ('none'),
    ('complete'),
    ('in-progress'),
    ('on-hold'),
    ('terminated');`);

    await queryMachine(`INSERT INTO reimbursementType(type) values
    ('none'),
    ('full'),
    ('half'),
    ('quarter'),
    ('partial');`);

    await queryMachine(`INSERT INTO users(username, password, firstName, lastName, email, role) values
    ('guest', 'guest', 'guest', 'guest', 'guest', (SELECT roleId FROM role WHERE role = 'guest')),
    ('admin', 'password', 'admin', 'admin', 'admin@db.com', (SELECT roleId FROM role WHERE role = 'admin')),
    ('fm', 'manager!', 'finance', 'manager', 'finance.manager@db.com', (SELECT roleId FROM role WHERE role = 'finance-manager')),
    ('JD', 'WAT1', 'John', 'Doe', '', (SELECT roleId FROM role WHERE role = 'user')),
    ('hackerman', 'hunter2', 'anon', 'ymous', 'get@pwnd.com', (SELECT roleId FROM role WHERE role = 'user'));`);

    await queryMachine(`INSERT INTO reimbursement(author, amount, dateSubmitted, dateResolved, description, resolver, status, type) values
    ((SELECT userId FROM users WHERE username = 'guest'), 5, 2015, 2017, 'I AM A GUEST!', NULL, (SELECT statusId FROM reimbursementStatus WHERE status = 'terminated'), NULL),
    ((SELECT userId FROM users WHERE username = 'admin'), 100, 2019, 2020, 'fm owes me money', (SELECT userId FROM users WHERE username = 'fm'), (SELECT statusId FROM reimbursementStatus WHERE status = 'complete'), (SELECT typeId FROM reimbursementType WHERE type = 'full')),
    ((SELECT userId FROM users WHERE username = 'fm'), 25, 2015, 2016, 'admin owes me money', (SELECT userId FROM users WHERE username = 'admin'), (SELECT statusId FROM reimbursementStatus WHERE status = 'complete'), (SELECT typeId FROM reimbursementType WHERE type = 'partial')),
    ((SELECT userId FROM users WHERE username = 'JD'), 980, 2013, 2014, 'i demand compensation!', NULL, (SELECT statusId FROM reimbursementStatus WHERE status = 'in-progress'), (SELECT typeId FROM reimbursementType WHERE type = 'half')),
    ((SELECT userId FROM users WHERE username = 'hackerman'), 1000000, 2010, 2020, 'give me tha dough', (SELECT userId FROM users WHERE username = 'hackerman'), (SELECT statusId FROM reimbursementStatus WHERE status = 'on-hold'), (SELECT typeId FROM reimbursementType WHERE type = 'full'));`);

}