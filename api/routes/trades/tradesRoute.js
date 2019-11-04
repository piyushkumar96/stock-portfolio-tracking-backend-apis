/*************************************************************************
*
*   Author:- piyushkumar96
*   Git:-    https://github.com/piyushkumar96
*   Folder Link:- https://github.com/piyushkumar96/stock-portfolio-tracking-backend-apis
* 
*   This file contains trades creation, updatation, deletion etc. routes
 **************************************************************************/

'use strict';

module.exports = function (app) {

   const tradesController = require('../../controllers/trades/tradesCntrl'),
      authentication = require('../../middleware/auth');

   // create trade route
   app.route('/api/v1/createTrade')
      .post(authentication.auth, tradesController.createTrade)

   // update trade details
   app.route('/api/v1/updateTradeDetails')
      .patch(authentication.auth, tradesController.updateTradeDetails)

   // delete trade 
   app.route('/api/v1/deleteTrade')
      .delete(authentication.auth, tradesController.deleteTrade)

   // get an trade
   app.route('/api/v1/getTrade/:trdId')
      .get(authentication.auth, tradesController.getTrade)

   // get all trades
   app.route('/api/v1/getAllTrades')
      .get(authentication.auth, tradesController.getAllTrades)

   // get all sell trades
   app.route('/api/v1/getAllSellTrades')
      .get(authentication.auth, tradesController.getAllSellTrades)

   // get all buy trades
   app.route('/api/v1/getAllBuyTrades')
      .get(authentication.auth, tradesController.getAllBuyTrades)

   // get a portfolio Details
   app.route('/api/v1/getPortfolio/:tickName')
      .get(authentication.auth, tradesController.getPortfolio)

   // get a Trade History
   app.route('/api/v1/getTradeHistory/:trdId')
      .get(authentication.auth, tradesController.getTradeHistory)

   // get all Trades History of Sell Type
   app.route('/api/v1/getAllSellTradesHistory')
      .get(authentication.auth, tradesController.getAllSellTradesHistory)

   // get all Trades History of Buy Type
   app.route('/api/v1/getAllBuyTradesHistory')
      .get(authentication.auth, tradesController.getAllBuyTradesHistory)

   // get all Trades History
   app.route('/api/v1/getAllTradesHistory')
      .get(authentication.auth, tradesController.getAllTradesHistory)

   // get a Trade history for a specific ticket
   app.route('/api/v1/getTicketTradeHistory/:tickName')
      .get(authentication.auth, tradesController.getTicketTradeHistory)

   // get a Trade history for a specific ticket of sell type
   app.route('/api/v1/getSellTicketTradeHistory/:tickName')
      .get(authentication.auth, tradesController.getSellTicketTradeHistory)

   // get a Trade history for a specific ticket of buy type
   app.route('/api/v1/getBuyTicketTradeHistory/:tickName')
      .get(authentication.auth, tradesController.getBuyTicketTradeHistory)

   // get all available trades of other users
   app.route('/api/v1/getAllAvailableTrades')
      .get(authentication.auth, tradesController.getAllAvailableTrades)

};
