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

        try {
            let trdId = await counterHlp.counters("tradeid", "1")

            let type = data.body.type,
                tickName = data.body.tickName,
                price = Number(data.body.price),
                quantity = Number(data.body.quantity),
                createdTS = new Date();

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
            if(trdFlag)
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
            logger.info(loggerName + trade)
            resolve(trade)
        }
    });

}
