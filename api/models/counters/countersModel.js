/*************************************************************************
*
*   Author:- piyushkumar96
*   Git:-    https://github.com/piyushkumar96
*   Folder Link:- https://github.com/piyushkumar96/stock-portfolio-tracking-backend-apis
* 
*   This file contains user Model require for creating sequence counter
 **************************************************************************/

'use strict';

//External modules
const   mongoose    = require('mongoose');

const Schema = mongoose.Schema;

const counterSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    seq: {
        type: Number,
        default: 0
    }
})

const counters = mongoose.model('counters', counterSchema);
module.exports = counters