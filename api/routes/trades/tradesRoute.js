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

    const   tradesController = require('../../controllers/trades/tradesCntrl'),
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

   // get all trades
   app.route('/api/v1/getAllTrades')
      .get(authentication.auth,tradesController.getAllTrades)  

   // get an trade
   app.route('/api/v1/getTrade/:trdId')
      .get(authentication.auth,tradesController.getTrade)  
   
};
