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
        jwt = require('jsonwebtoken');

// Internal Modules
const   user = require('../../../models/users/usersModel'),
        config = require('../../../../config/config.json'),
        helper = require('./../../../fabric-libs/helper');

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    Id: "SELRK",
    name: 'Rishu Kumar',
    email: 'rishu@gmail.com',
    password: 'Rishu@123',
    role: 'buyer',
    location: 'Hyderabad',
    tokens: [{
        token: jwt.sign({ _id: userOneId}, config.jwt_secret)
    }]
}


const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    Id: "SELAK",
    name: 'Ayush Kumar',
    email: 'ayush@gmail.com',
    password: 'Ayush@123',
    role: 'buyer',
    location: 'Mumbai, Maharastra',
    tokens: [{
        token: jwt.sign({ _id: userTwoId}, config.jwt_secret)
    }]
}

const setupDatabase = async () => {
    await user.deleteMany()
    await new user(userOne).save()
    //await new user(userTwo).save()
    await helper.getRegisteredUser(userOne.Id, config.orgName, true, "user");
    //await helper.getRegisteredUser(userTwo.Id, config.orgName, true, "user");
}

module.exports = {
    userOne,
    userOneId,
    //userTwo,
    //userTwoId,
    setupDatabase
}
