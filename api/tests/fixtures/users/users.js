/*************************************************************************
*
*   Author:- piyushkumar96
*   Git:-    https://github.com/piyushkumar96
*   Folder Link:- https://github.com/piyushkumar96/stock-portfolio-tracking-backend-apis
* 
*   This file is used for setting up the environment variables for testing users routes
 **************************************************************************/

'use strict';

//External Modules 
const   mongoose = require('mongoose'),
        jwt = require('jsonwebtoken'),
        uuidv4 = require('uuid/v4');

// Internal Modules
const   user = require('../../../models/users/usersModel'),
        config = require('../../../../config/config.json');
        
const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    Id: uuidv4(),
    name: 'Piyu Kumar',
    email: 'piyu@gmail.com',
    password: 'Welcome@123',
    age: 23,
    portfolios : [
        {
            "tickName": "TCS",
            "avgBuyPrice": 1833.45,
            "quantity": 10
        },
        {
            "tickName": "WIPRO",
            "avgBuyPrice": 319.25,
            "quantity": 10
        },
        {
            "tickName": "GODREJIND",
            "avgBuyPrice": 535.00,
            "quantity": 2
        }
    ],
    tokens: [{
        token: jwt.sign({ _id: userOneId}, config.jwt_secret)
    }]
}


const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    Id: uuidv4(),
    name: 'Ayush Kumar',
    email: 'ayush@gmail.com',
    password: 'Welcome@123',
    age: 22,
    portfolios : [
        {
            "tickName": "TCS",
            "avgBuyPrice": 1733.45,
            "quantity": 5
        },
        {
            "tickName": "WIPRO",
            "avgBuyPrice": 419.25,
            "quantity": 5
        },
        {
            "tickName": "GODREJIND",
            "avgBuyPrice": 635.00,
            "quantity": 1
        }
    ],
    tokens: [{
        token: jwt.sign({ _id: userTwoId}, config.jwt_secret)
    }]
}

const setupDatabase = async () => {
    await user.deleteMany()
    await new user(userOne).save()
    //await new user(userTwo).save()
    //await helper.getRegisteredUser(userOne.Id, config.orgName, true, "user");
    //await helper.getRegisteredUser(userTwo.Id, config.orgName, true, "user");
}

module.exports = {
    userOne,
    userOneId,
    userTwo,
    userTwoId,
    setupDatabase
}
