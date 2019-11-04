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

// function for creating a new Trade
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

// function for updating Trade details
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


// function for deleting Trade
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

// function for getting a Trade details
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

// function for getting all Trades
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

// function for getting all sell Trades
exports.getAllSellTrades = async function (req, res) {

    try {
        let trades = await tradesSvc.getAllSellTrades(req);

        if (trades.length === 0)
            var result = "No Sell Trades Created yet"
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

// function for getting all buy Trades
exports.getAllBuyTrades = async function (req, res) {

    try {
        let trades = await tradesSvc.getAllBuyTrades(req);

        if (trades.length === 0)
            var result = "No Buy Trades Created yet"
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


// function for getting a Fortfolio details
exports.getPortfolio = async function (req, res) {

    try {
        let result = await tradesSvc.getPortfolio(req);
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

// function for getting a Trade History with Trade Id
exports.getTradeHistory = async function (req, res) {

    try {
        let result = await tradesSvc.getTradeHistory(req);

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

// function for getting all Trade History of buy type
exports.getAllSellTradesHistory = async function (req, res) {

    try {
        let result = await tradesSvc.getAllSellTradesHistory(req);
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

// function for getting all Trade History of buy type
exports.getAllBuyTradesHistory = async function (req, res) {

    try {
        let result = await tradesSvc.getAllBuyTradesHistory(req);
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

// function for getting all Trade History
exports.getAllTradesHistory = async function (req, res) {

    try {
        let trdHistory = req.user.tradesHistory
        if (trdHistory.length === 0)
            var result = "No Trade Tranfered yet"
        else
            var result = trdHistory

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

// function for getting a Trade history for a specific ticket
exports.getTicketTradeHistory = async function (req, res) {

    try {
        let result = await tradesSvc.getTicketTradeHistory(req);
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

// function for getting a Ticket Trade History of sell type
exports.getSellTicketTradeHistory = async function (req, res) {

    try {
        let result = await tradesSvc.getSellTicketTradeHistory(req);
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

// function for getting a Ticket Trade History of buy type
exports.getBuyTicketTradeHistory = async function (req, res) {

    try {
        let result = await tradesSvc.getBuyTicketTradeHistory(req);
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

// function for getting all available trades of other users
exports.getAllAvailableTrades = async function (req, res) {

    try {
        let result = await tradesSvc.getAllAvailableTrades(req);
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