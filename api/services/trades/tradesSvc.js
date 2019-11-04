/*************************************************************************
*
*   Author:- piyushkumar96
*   Git:-    https://github.com/piyushkumar96
*   Folder Link:- https://github.com/piyushkumar96/stock-portfolio-tracking-backend-apis
* 
*   This file contains Orders addition, updation main logic
 **************************************************************************/

'use strict';

// Internal Modules
const config = require('../../../config/config.json'),
    logger = require('../../../logger'),
    userSchema = require('../../models/users/usersModel'),
    counterHlp = require('../../helpers/counters/countersHlp');

const loggerName = "[ordersSvc ]: ";

/**
 * Add Trade
 * @param {String} type
 * @param {String} tickName
 * @param {String} price
 * @param {String} quantity
 *
 * @returns {Promise}
 */

exports.createTrade = function (data) {

    return new Promise(async (resolve, reject) => {

        let type = data.body.type,
            tickName = data.body.tickName,
            price = Number(data.body.price),
            quantity = Number(data.body.quantity),
            createdTS = new Date();

        let checkFlag = false;
        if (type === "sell") {
            for (let i = 0; i < data.user.portfolios.length; i++) {
                if (data.user.portfolios[i].tickName === tickName) {
                    checkFlag = true
                    break;
                }
            }
        } else {
            checkFlag = true
        }

        if (checkFlag === false) {
            logger.error(loggerName + " Cann't Create Sell Trade for non-existed Ticket " + tickName + " in portfolio")
            reject("Cann't Create Sell Trade for non-existed Ticket " + tickName + " in portfolio")
        } else {

            try {

                let trdId = await counterHlp.counters("tradeid", "1")

                let trade = {}
                trade.trdId = trdId
                trade.type = type
                trade.tickName = tickName
                trade.price = price
                trade.quantity = quantity
                trade.createdTS = createdTS

                userSchema.findOne({
                    $and: [
                        {
                            "trades": {
                                $elemMatch: {
                                    $and: [
                                        { "type": { $ne: type } },
                                        { "tickName": tickName },
                                        { "price": price },
                                        { "quantity": { $gte: quantity } }
                                    ]
                                }
                            }
                        },
                        {
                            "Id": { $ne: data.user.Id }
                        }
                    ]
                })
                    .exec()
                    .then(async (userDB) => {
                        if (userDB) {

                            let newTrades = [],
                                flag = true;

                            var transferTS = new Date()

                            for (let i = 0; i < userDB.trades.length; i++) {

                                if (flag && (userDB.trades[i].type !== type) && (userDB.trades[i].tickName === tickName) && (userDB.trades[i].price === price) && (userDB.trades[i].quantity >= quantity)) {

                                    userDB.trades[i].quantity = userDB.trades[i].quantity - quantity;

                                    let trdHis = {}
                                    if (type === "buy")
                                        trdHis.type = "sell"
                                    else
                                        trdHis.type = "buy"

                                    var userDBTrdId = userDB.trades[i].trdId

                                    trdHis.trdId = userDB.trades[i].trdId
                                    trdHis.tickName = tickName
                                    trdHis.price = price
                                    trdHis.quantity = quantity
                                    trdHis.createdTS = createdTS
                                    trdHis.transferTS = transferTS

                                    let usrDetails = {}
                                    usrDetails.usrId = data.user.Id
                                    usrDetails.usrName = data.user.name
                                    usrDetails.usrTrdId = trdId

                                    trdHis.usrDetails = usrDetails

                                    userDB.tradesHistory.push(trdHis)

                                    flag = false
                                }
                                if (userDB.trades[i].quantity !== 0)
                                    newTrades.push(userDB.trades[i])


                            }

                            // updating the portfolios of the user who have placed the trade earlier
                            let newPortfolios = [],
                                newPortfolioFlag = true;
                            for (let i = 0; i < userDB.portfolios.length; i++) {

                                if (userDB.portfolios[i].tickName === tickName) {
                                    newPortfolioFlag = false;
                                    if (type === "buy") {

                                        userDB.portfolios[i].avgBuyPrice = ((userDB.portfolios[i].quantity * userDB.portfolios[i].avgBuyPrice) - (quantity * price)) / (userDB.portfolios[i].quantity - quantity)
                                        userDB.portfolios[i].quantity = userDB.portfolios[i].quantity - quantity;

                                    } else if (type === "sell") {

                                        userDB.portfolios[i].avgBuyPrice = ((userDB.portfolios[i].quantity * userDB.portfolios[i].avgBuyPrice) + (quantity * price)) / (userDB.portfolios[i].quantity + quantity)
                                        userDB.portfolios[i].quantity = userDB.portfolios[i].quantity + quantity;

                                    }
                                }
                                if (userDB.portfolios[i].quantity !== 0)
                                    newPortfolios.push(userDB.portfolios[i])
                            }

                            // If this portfolio doesnot existed in user profile then adding thid portfolio 
                            if (newPortfolioFlag) {
                                let newPtfl = {}
                                newPtfl.tickName = tickName
                                newPtfl.avgBuyPrice = price
                                newPtfl.quantity = quantity

                                newPortfolios.push(newPtfl)
                            }
                            userSchema.findOneAndUpdate(
                                {
                                    "Id": userDB.Id
                                },
                                {
                                    $set: {
                                        "trades": newTrades,
                                        "portfolios": newPortfolios,
                                        "tradesHistory": userDB.tradesHistory
                                    }
                                },
                                {
                                    upsert: false,
                                    new: true
                                },
                                async function (err, doc) {
                                    if (err) {
                                        counterHlp.counters("tradeid", "-1")
                                        logger.error(loggerName + err)
                                        reject("Error in while doing trading")

                                    } else {

                                        let trdHis = {};

                                        trdHis.type = type
                                        trdHis.trdId = trdId
                                        trdHis.tickName = tickName
                                        trdHis.price = price
                                        trdHis.quantity = quantity
                                        trdHis.createdTS = createdTS
                                        trdHis.transferTS = transferTS

                                        let usrDetails = {}
                                        usrDetails.usrId = userDB.Id
                                        usrDetails.usrName = userDB.name
                                        usrDetails.usrTrdId = userDBTrdId

                                        trdHis.usrDetails = usrDetails

                                        data.user.tradesHistory.push(trdHis)

                                        // updating the portfolios of current user who just have placed the trade
                                        let updatedPortfolios = [],
                                            newPortfolioFlag = true;

                                        for (let i = 0; i < data.user.portfolios.length; i++) {

                                            if (data.user.portfolios[i].tickName === tickName) {
                                                newPortfolioFlag = false;

                                                if (type === "sell") {

                                                    data.user.portfolios[i].avgBuyPrice = ((data.user.portfolios[i].quantity * data.user.portfolios[i].avgBuyPrice) - (quantity * price)) / (data.user.portfolios[i].quantity - quantity)
                                                    data.user.portfolios[i].quantity = data.user.portfolios[i].quantity - quantity;

                                                } else if (type === "buy") {

                                                    data.user.portfolios[i].avgBuyPrice = ((data.user.portfolios[i].quantity * data.user.portfolios[i].avgBuyPrice) + (quantity * price)) / (data.user.portfolios[i].quantity + quantity)
                                                    data.user.portfolios[i].quantity = data.user.portfolios[i].quantity + quantity;

                                                }
                                            }
                                            if (data.user.portfolios[i].quantity !== 0)
                                                updatedPortfolios.push(data.user.portfolios[i])
                                        }


                                        // If this portfolio doesnot existed in user profile then adding thid portfolio 
                                        if (newPortfolioFlag) {
                                            let newPtfl = {}
                                            newPtfl.tickName = tickName
                                            newPtfl.avgBuyPrice = price
                                            newPtfl.quantity = quantity

                                            updatedPortfolios.push(newPtfl)
                                        }

                                        userSchema.findOneAndUpdate(
                                            {
                                                "Id": data.user.Id
                                            },
                                            {
                                                $set: {
                                                    "portfolios": updatedPortfolios,
                                                    "tradesHistory": data.user.tradesHistory
                                                }
                                            },
                                            {
                                                upsert: false,
                                                new: true
                                            },
                                            function (err, doc) {
                                                if (err) {
                                                    counterHlp.counters("tradeid", "-1")
                                                    logger.error(loggerName + err);
                                                    reject("Error Occurred while creating trade")

                                                } else {
                                                    logger.info(loggerName + "Trade " + data.user.trades + " Trade Successfully Created and Placed @@@")
                                                    resolve("Trade Successfully Created and Placed")
                                                }
                                            }
                                        );
                                    }
                                })
                        } else {
                            try {
                                data.user.trades.push(trade)
                                await data.user.save()
                                logger.info(loggerName + "Trade " + data.user.trades + " Trade Successfully Created @@@")
                                resolve("Trade Successfully Created")

                            } catch (err) {
                                let trdId = await counterHlp.counters("tradeid", "-1")
                                logger.error(loggerName + err);
                                reject("Something failed, Please retry");
                            }
                        }
                    })
            } catch (error) {
                logger.error(loggerName + ' Error Occurred while generating the Trade Id', error);
                reject(error)
            }
        }
    });

}

/**
 * update Trade Details
 * @param {String} trdId
 * @param {String} type
 * @param {String} tickName
 * @param {String} price
 * @param {String} quantity
 *
 * @returns {Promise}
 */

exports.updateTradeDetails = function (data) {
    return new Promise(async (resolve, reject) => {

        let trdId = data.body.trdId,
            type = data.body.type,
            tickName = data.body.tickName,
            price = Number(data.body.price),
            quantity = Number(data.body.quantity);
        let trade = {}
        trade.type = type
        trade.tickName = tickName
        trade.price = price
        trade.quantity = quantity

        let flagTrade = false,
            trdFlag = true,
            uptdTrades = [];

        for (let i = 0; i < data.user.trades.length; i++) {

            if (trdFlag && (data.user.trades[i].trdId === trdId) && (data.user.trades[i].type === type) && (data.user.trades[i].tickName === tickName)) {
                data.user.trades[i].quantity = quantity;
                data.user.trades[i].price = price;
                var createdTS = data.user.trades[i].createdTS
                flagTrade = true
                trdFlag = false
            }
            if (trdFlag)
                uptdTrades.push(data.user.trades[i])

        }

        if (flagTrade === false) {
            logger.error(loggerName + "Mentioned trade doesn't existed")
            reject("Mentioned trade doesn't existed")
        } else {

            userSchema.findOne({
                $and: [
                    {
                        "trades": {
                            $elemMatch: {
                                $and: [
                                    { "type": { $ne: type } },
                                    { "tickName": tickName },
                                    { "price": price },
                                    { "quantity": { $gte: quantity } }
                                ]
                            }
                        }
                    },
                    {
                        "Id": { $ne: data.user.Id }
                    }
                ]
            })
                .exec()
                .then(async (userDB) => {
                    if (userDB) {
                        console.log(userDB)
                        let newTrades = [],
                            flag = true;

                        var transferTS = new Date()

                        for (let i = 0; i < userDB.trades.length; i++) {

                            if (flag && (userDB.trades[i].type !== type) && (userDB.trades[i].tickName === tickName) && (userDB.trades[i].price === price) && (userDB.trades[i].quantity >= quantity)) {

                                userDB.trades[i].quantity = userDB.trades[i].quantity - quantity;

                                let trdHis = {}
                                if (type === "buy")
                                    trdHis.type = "sell"
                                else
                                    trdHis.type = "buy"

                                var userDBTrdId = userDB.trades[i].trdId

                                trdHis.trdId = userDB.trades[i].trdId
                                trdHis.tickName = tickName
                                trdHis.price = price
                                trdHis.quantity = quantity
                                trdHis.createdTS = createdTS
                                trdHis.transferTS = transferTS

                                let usrDetails = {}
                                usrDetails.usrId = data.user.Id
                                usrDetails.usrName = data.user.name
                                usrDetails.usrTrdId = trdId

                                trdHis.usrDetails = usrDetails

                                userDB.tradesHistory.push(trdHis)

                                flag = false
                            }
                            if (userDB.trades[i].quantity !== 0)
                                newTrades.push(userDB.trades[i])


                        }

                        // updating the portfolios of the user who have placed the trade earlier
                        let newPortfolios = []
                        for (let i = 0; i < userDB.portfolios.length; i++) {

                            if (userDB.portfolios[i].tickName === tickName) {
                                if (type === "buy") {

                                    userDB.portfolios[i].avgBuyPrice = ((userDB.portfolios[i].quantity * userDB.portfolios[i].avgBuyPrice) - (quantity * price)) / (userDB.portfolios[i].quantity - quantity)
                                    userDB.portfolios[i].quantity = userDB.portfolios[i].quantity - quantity;

                                } else if (type === "sell") {

                                    userDB.portfolios[i].avgBuyPrice = ((userDB.portfolios[i].quantity * userDB.portfolios[i].avgBuyPrice) + (quantity * price)) / (userDB.portfolios[i].quantity + quantity)
                                    userDB.portfolios[i].quantity = userDB.portfolios[i].quantity + quantity;

                                }
                            }
                            if (userDB.portfolios[i].quantity !== 0)
                                newPortfolios.push(userDB.portfolios[i])
                        }

                        userSchema.findOneAndUpdate(
                            {
                                "Id": userDB.Id
                            },
                            {
                                $set: {
                                    "trades": newTrades,
                                    "portfolios": newPortfolios,
                                    "tradesHistory": userDB.tradesHistory
                                }
                            },
                            {
                                upsert: false,
                                new: true
                            },
                            async function (err, doc) {
                                if (err) {
                                    counterHlp.counters("tradeid", "-1")
                                    logger.error(loggerName + err)
                                    reject("Error in while doing trading")

                                } else {

                                    let trdHis = {};

                                    trdHis.type = type
                                    trdHis.trdId = trdId
                                    trdHis.tickName = tickName
                                    trdHis.price = price
                                    trdHis.quantity = quantity
                                    trdHis.createdTS = createdTS
                                    trdHis.transferTS = transferTS

                                    let usrDetails = {}
                                    usrDetails.usrId = userDB.Id
                                    usrDetails.usrName = userDB.name
                                    usrDetails.usrTrdId = userDBTrdId

                                    trdHis.usrDetails = usrDetails

                                    data.user.tradesHistory.push(trdHis)

                                    // updating the portfolios of current user who just have placed the trade
                                    let updatedPortfolios = []
                                    for (let i = 0; i < data.user.portfolios.length; i++) {

                                        if (data.user.portfolios[i].tickName === tickName) {
                                            if (type === "sell") {

                                                data.user.portfolios[i].avgBuyPrice = ((data.user.portfolios[i].quantity * data.user.portfolios[i].avgBuyPrice) - (quantity * price)) / (data.user.portfolios[i].quantity - quantity)
                                                data.user.portfolios[i].quantity = data.user.portfolios[i].quantity - quantity;

                                            } else if (type === "buy") {

                                                data.user.portfolios[i].avgBuyPrice = ((data.user.portfolios[i].quantity * data.user.portfolios[i].avgBuyPrice) + (quantity * price)) / (data.user.portfolios[i].quantity + quantity)
                                                data.user.portfolios[i].quantity = data.user.portfolios[i].quantity + quantity;

                                            }
                                        }
                                        if (data.user.portfolios[i].quantity !== 0)
                                            updatedPortfolios.push(data.user.portfolios[i])
                                    }

                                    userSchema.findOneAndUpdate(
                                        {
                                            "Id": data.user.Id
                                        },
                                        {
                                            $set: {
                                                "trades": uptdTrades,
                                                "portfolios": data.user.portfolios,
                                                "tradesHistory": data.user.tradesHistory
                                            }
                                        },
                                        {
                                            upsert: false,
                                            new: true
                                        },
                                        function (err, doc) {
                                            if (err) {
                                                counterHlp.counters("tradeid", "-1")
                                                logger.error(loggerName + err);
                                                reject("Error Occurred while updating trade")

                                            } else {
                                                logger.info(loggerName + "Trade " + data.user.trades + " Trade Successfully Updated and Placed @@@")
                                                resolve("Trade Successfully Updated and Placed")
                                            }
                                        }
                                    );
                                }
                            })
                    } else {

                        userSchema.findOneAndUpdate(
                            {
                                "Id": data.user.Id
                            },
                            {
                                $set: {
                                    "trades": data.user.trades
                                }
                            },
                            {
                                upsert: false,
                                new: true
                            },
                            function (err, doc) {
                                if (err) {
                                    logger.error(loggerName + err)
                                    reject("Error Occurred while updating trade")

                                } else {
                                    logger.info(loggerName + "Trade " + data.user.trades + " Trade Successfully Updated @@@")
                                    resolve("Trade Successfully Updated")
                                }
                            }
                        );
                    }
                })
        }
    });

}

/**
 * delete Trade 
 * @param {String} trdId
 * @param {String} type
 * @param {String} tickName
 * @param {String} price
 * @param {String} quantity
 *
 * @returns {Promise}
 */

exports.deleteTrade = function (data) {

    let trdId = data.body.trdId

    let flagTrade = false,
        updatedTrades = [];

    return new Promise(async (resolve, reject) => {

        for (let i = 0; i < data.user.trades.length; i++) {

            if (data.user.trades[i].trdId === trdId) {
                flagTrade = true
            } else {
                updatedTrades.push(data.user.trades[i])
            }
        }

        if (flagTrade === false) {
            logger.error(loggerName + "Mentioned trade doesn't existed with ID " + trdId)
            reject("Mentioned trade doesn't existed")
        } else {

            data.user.trades = updatedTrades
            try {
                await data.user.save()
                logger.info(loggerName + " Trade Successfully Deleted")
                resolve(" Trade Successfully Deleted")

            } catch (err) {
                logger.error(loggerName + err);
                reject("Error Occurred while deleting trade")
            }
        }
    });

}

/**
 * get a Trade Details 
 * @param {String} trdId
 * 
 * @returns {Promise}
 */

exports.getTrade = function (data) {

    let trdId = data.params.trdId

    let flagTrade = false,
        trade;

    return new Promise(async (resolve, reject) => {

        for (let i = 0; i < data.user.trades.length; i++) {

            if (data.user.trades[i].trdId === trdId) {
                flagTrade = true
                trade = data.user.trades[i]
                break;
            }
        }

        if (flagTrade === false) {
            logger.error(loggerName + "Mentioned trade doesn't existed with ID " + trdId)
            reject("Mentioned trade doesn't existed")
        } else {
            logger.info(loggerName + "trade details " + trade)
            resolve(trade)
        }
    });

}

/**
 * get all sell Trades 
 * 
 * @returns {Promise}
 */

exports.getAllSellTrades = function (data) {

    let sellTrade = []

    return new Promise(async (resolve, reject) => {

        for (let i = 0; i < data.user.trades.length; i++) {

            if (data.user.trades[i].type === "sell") {
                sellTrade.push(data.user.trades[i])
            }
        }

        logger.info(loggerName + " Trade history " + sellTrade + " of sell type")
        resolve(sellTrade)

    });

}

/**
 * get all buy Trades 
 * 
 * @returns {Promise}
 */

exports.getAllBuyTrades = function (data) {

    let buyTrade = []

    return new Promise(async (resolve, reject) => {

        for (let i = 0; i < data.user.trades.length; i++) {

            if (data.user.trades[i].type === "buy") {
                buyTrade.push(data.user.trades[i])
            }
        }

        logger.info(loggerName + " Trade history " + buyTrade + " of buy type")
        resolve(buyTrade)

    });

}

/**
 * get a Portfolio Details 
 * @param {String} tickName
 * 
 * @returns {Promise}
 */

exports.getPortfolio = function (data) {

    let tickName = data.params.tickName

    let flagPortfolio = false,
        portfolio;

    return new Promise(async (resolve, reject) => {

        for (let i = 0; i < data.user.portfolios.length; i++) {

            if (data.user.portfolios[i].tickName === tickName) {
                flagPortfolio = true
                portfolio = data.user.portfolios[i]
                break;
            }
        }

        if (flagPortfolio === false) {
            logger.error(loggerName + "Mentioned Portfolio doesn't existed with Ticket Name " + tickName)
            reject("Mentioned Portfolio doesn't existed")
        } else {
            logger.info(loggerName + "portfolio details " + portfolio)
            resolve(portfolio)
        }

    });

}

/**
 * get a Trade History using Trade Id 
 * @param {String} trdId
 * 
 * @returns {Promise}
 */

exports.getTradeHistory = function (data) {

    let trdId = data.params.trdId
    let flagTrade = false,
        trdHis;

    return new Promise(async (resolve, reject) => {

        for (let i = 0; i < data.user.tradesHistory.length; i++) {

            if (data.user.tradesHistory[i].trdId === trdId) {
                flagTrade = true
                trdHis = data.user.tradesHistory[i]
            }
        }

        if (flagTrade === false) {
            logger.error(loggerName + " No Trade History for given Trade Id " + trdId)
            reject("No Trade History with Trade Id " + trdId)
        } else {
            logger.info(loggerName + " Trade history with trade id " + trdId + " " + trdHis)
            resolve(trdHis)
        }
    });

}

/**
 * get all Trades History of sell type
 * 
 * @returns {Promise}
 */

exports.getAllSellTradesHistory = function (data) {

    let flagTrade = false,
        sellTrdHis = [];

    return new Promise(async (resolve, reject) => {

        for (let i = 0; i < data.user.tradesHistory.length; i++) {

            if (data.user.tradesHistory[i].type === "sell") {
                flagTrade = true
                sellTrdHis.push(data.user.tradesHistory[i])
            }
        }

        if (flagTrade === false) {
            logger.error(loggerName + " No Trades History of Sell type")
            reject("No Trades History of Sell type")
        } else {
            logger.info(loggerName + " Trades history " + sellTrdHis + " of Sell type")
            resolve(sellTrdHis)
        }
    });

}

/**
 * get all Trades History of buy type
 * 
 * @returns {Promise}
 */

exports.getAllBuyTradesHistory = function (data) {

    let flagTrade = false,
        buyTrdHis = [];

    return new Promise(async (resolve, reject) => {

        for (let i = 0; i < data.user.tradesHistory.length; i++) {

            if (data.user.tradesHistory[i].type === "buy") {
                flagTrade = true
                buyTrdHis.push(data.user.tradesHistory[i])
            }
        }

        if (flagTrade === false) {
            logger.error(loggerName + " No Trades History of Buy type")
            reject("No Trades History of Buy type")
        } else {
            logger.info(loggerName + " Trades history " + buyTrdHis + " of Buy type")
            resolve(buyTrdHis)
        }
    });

}

/**
 * get a Ticket Trade History 
 * @param {String} tickName
 * 
 * @returns {Promise}
 */

exports.getTicketTradeHistory = function (data) {

    let tickName = data.params.tickName

    let flagTrade = false,
        trdHis = [];

    return new Promise(async (resolve, reject) => {

        for (let i = 0; i < data.user.tradesHistory.length; i++) {
            if (data.user.tradesHistory[i].tickName === tickName) {
                flagTrade = true
                trdHis.push(data.user.tradesHistory[i])
            }
        }

        if (flagTrade === false) {
            logger.error(loggerName + " No Trade History for given Ticket name " + tickName)
            reject("No Trade History for " + tickName)
        } else {
            logger.info(loggerName + " Trade history " + trdHis)
            resolve(trdHis)
        }
    });

}

/**
 * get a Ticket Trade History of sell type
 * @param {String} tickName
 * 
 * @returns {Promise}
 */

exports.getSellTicketTradeHistory = function (data) {

    let tickName = data.params.tickName

    let flagTrade = false,
        trdHis = [];

    return new Promise(async (resolve, reject) => {

        for (let i = 0; i < data.user.tradesHistory.length; i++) {

            if ((data.user.tradesHistory[i].tickName === tickName) && (data.user.tradesHistory[i].type === "sell")) {
                flagTrade = true
                trdHis.push(data.user.tradesHistory[i])
            }
        }

        if (flagTrade === false) {
            logger.error(loggerName + " No Trade History of Sell type for given Ticket name " + tickName)
            reject("No Trade History of Sell type for " + tickName)
        } else {
            logger.info(loggerName + " Trade history " + trdHis + " of sell type")
            resolve(trdHis)
        }
    });

}

/**
 * get a Ticket Trade History of buy type
 * @param {String} tickName
 * 
 * @returns {Promise}
 */

exports.getBuyTicketTradeHistory = function (data) {

    let tickName = data.params.tickName

    let flagTrade = false,
        trdHis = [];

    return new Promise(async (resolve, reject) => {

        for (let i = 0; i < data.user.tradesHistory.length; i++) {

            if ((data.user.tradesHistory[i].tickName === tickName) && (data.user.tradesHistory[i].type === "buy")) {
                flagTrade = true
                trdHis.push(data.user.tradesHistory[i])
            }
        }

        if (flagTrade === false) {
            logger.error(loggerName + " No Trade History of Buy type for given Ticket name " + tickName)
            reject("No Trade History of Buy type for " + tickName)
        } else {
            logger.info(loggerName + " Trade history " + trdHis + " of buy type")
            resolve(trdHis)
        }
    });

}


/**
 * getting all available trades of other users
 *
 * @returns {Promise}
 */

exports.getAllAvailableTrades = function (data) {

    return new Promise(async (resolve, reject) => {

        userSchema.find({
            "Id": { $ne: data.user.Id }
        },
        {
            _id: 0,
            "trades": 1
        })
        .exec()
        .then(async (userDBs) => {
            if (userDBs.length != 0) {
                let trades = []
                for(let i=0; i<userDBs.length; i++){
                    trades = [...trades , ...userDBs[i].trades]
                }
                resolve(trades)
            } else {
                logger.info(loggerName + " No trades available")
                reject("No trades available")
            }
        })
        .catch((err) => {
            logger.error(loggerName + " Error in getting all available trades of other users " + err)
            reject("Something happened wrong. Please try again")
        })

    })

}