/*************************************************************************
*
*   Author:- piyushkumar96
*   Git:-    https://github.com/piyushkumar96
*   Folder Link:- https://github.com/piyushkumar96/stock-portfolio-tracking-backend-apis
* 
*   This file contains all test cases for orders
 **************************************************************************/

'use strict';

//External Modules 
const   request = require('supertest');

// Internal Modules
const   server = require('../../../server'),
        userModel = require('../../models/users/usersModel');

const { userOne, userOneId, userTwo, userTwoId, setupDatabase } = require('../fixtures/users/users')

// test for adding the new Order
test('Should add a New Order', async () => {
    // const response = await request(server)
    //     .post('/api/v1/addOrder')
    //     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    //     .send({
    //         orderName:"Vegetables",
	//         sellerId: "SEL1",
	//         sellerLoc:"Bengaluru, Karnataka"

    //     })
    //     .expect(200) 
})