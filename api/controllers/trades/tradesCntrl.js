/*************************************************************************
*
*   Author:- piyushkumar96
*   Git:-    https://github.com/piyushkumar96
*   Folder Link:- https://github.com/piyushkumar96/stock-portfolio-tracking-backend-apis
* 
*   This file contains traders creation, updation, deletion etc.
 **************************************************************************/

'use strict';

// Internal Modules
const tradesSvc = require('../../services/trades/tradesSvc'),
    logger = require('../../../logger');

const loggerName = "[tradesCntrl]: ";

// function for creating a new trade
exports.createTrade = async function (req, res) {
    let type = req.body.type,
        tickName = req.body.tickName,
        price = req.body.price,
        quantity = req.body.quantity;
     console.log(req.body)
    if (!type || !tickName || !price || !quantity) {
        logger.error(loggerName + "Invalid Parameters while creating trade !!!")
        res.status(400).json({
            success: false,
            message: 'Invalid parameters'
        });
    } else if ((quantity < 0) || (price < 0)) {
        logger.error(loggerName + "Price or Quantity should be greater than 0 while creating trade !!!")
        res.status(400).json({
            success: false,
            message: 'Price or Quantity should be greater than 0'
        });
    } else {
        try {
            let result = await tradesSvc.createTrade(req);
            res.status(200).json({
                success: true,
                message: result
            });
        } catch (err) {
            logger.error(loggerName + err)
            res.status(400).json({
                success: false,
                message: err
            });
        }
    }

}

// function for updating trade details
exports.updateTradeDetails = async function (req, res) {
    let trdId = req.body.trdId,
        type = req.body.type,
        tickName = req.body.tickName,
        price = req.body.price,
        quantity = req.body.quantity;

    if (!trdId || !type || !tickName || !price || !quantity) {
        logger.error(loggerName + "Invalid Parameters while updating trade !!!")
        res.status(400).json({
            success: false,
            message: 'Invalid parameters'
        });
    } else if ((quantity < 0) || (price < 0)) {
        logger.error(loggerName + "Price or Quantity should be greater than 0 while updating trade !!!")
        res.status(400).json({
            success: false,
            message: 'Price or Quantity should be greater than 0'
        });
    } else {

        try {
            let result = await tradesSvc.updateTradeDetails(req);
            res.status(200).json({
                success: true,
                message: result
            });
        } catch (err) {
            logger.error(loggerName + err)
            res.status(400).json({
                success: false,
                message: err
            });
        }
    }
}


// function for deleting trade
exports.deleteTrade = async function (req, res) {
    let trdId = req.body.trdId;

    if (!trdId) {
        logger.error(loggerName + "Invalid Parameters while deleting trade !!!")
        res.status(400).json({
            success: false,
            message: 'Invalid parameters'
        });
    } else {

        try {
            let result = await tradesSvc.deleteTrade(req);
            res.status(200).json({
                success: true,
                message: result
            });
        } catch (err) {
            logger.error(loggerName + err)
            res.status(400).json({
                success: false,
                message: err
            });
        }
    }
}

// function for getting all trades
exports.getAllTrades = async function (req, res) {

    try {
        let trades = req.user.trades
        if (trades.length === 0)
            var result = "No Trades Created yet"
        else
            var result = trades

        res.status(200).json({
            success: true,
            message: result
        });
    } catch (err) {
        logger.error(loggerName + err)
        res.status(400).json({
            success: false,
            message: err
        });
    }
}

// function for getting a trade details
exports.getTrade = async function (req, res) {

    try {
        let result = await tradesSvc.getTrade(req);
        res.status(200).json({
            success: true,
            message: result
        });
    } catch (err) {
        logger.error(loggerName + err)
        res.status(400).json({
            success: false,
            message: err
        });
    }
}
