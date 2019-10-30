/*************************************************************************
*
*   Author:- piyushkumar96
*   Git:-    https://github.com/piyushkumar96
*   Folder Link:- https://github.com/piyushkumar96/stock-portfolio-tracking-backend-apis
* 
*   This file contains autoincrement counter for users and orders
 **************************************************************************/
'use strict';

// External Modules
const jwt = require('jsonwebtoken');

// Internal Modules
const counterSchema = require('../../models/counters/countersModel'),
    logger = require('./../../../logger');

const loggerName = "[counterHelper ]: ";

exports.counters =  (role, count) => {

return new Promise((resolve, reject) => {
    try {
        if (role == "tradeid") {
            counterSchema.findByIdAndUpdate({ _id: 'tradeid' },
                { $inc: { seq: parseInt(count) } },
                {
                    new: true,
                    upsert: true // Make this update into an upsert
                },
                function (error, counter) {
                    if (error)
                        throw Error("Something happened wrong. Please try again");
                    resolve ("TRD" + counter.seq);
                });
        }else{

            reject("Invalid Counter type.")
        }
    } catch (err) {
        logger.error(loggerName + err)
        reject("Something happened wrong. Please try again")
    }
})
}