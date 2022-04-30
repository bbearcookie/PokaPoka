module.exports = (app) => {
  app.use('/test', require('../routes/testCtrl'));
  app.use('/api/auth', require('../routes/authCtrl'));
  app.use('/api/payment', require('../routes/paymentCtrl'));
  app.use('/api/photo', require('../routes/photoCtrl'));
  app.use('/api/sms', require('../routes/smsCtrl'));
  app.use('/api/suggestion', require('../routes/suggestionCtrl'));
  app.use('/api/trade', require('../routes/tradeCtrl'));
  app.use('/api/finding', require('../routes/findingCtrl'));
  app.use('/api/admin', require('../routes/admin/groupCtrl'));
  app.use('/api/admin', require('../routes/admin/memberCtrl'));
  app.use('/api/admin', require('../routes/admin/albumCtrl'));
  app.use('/api/admin', require('../routes/admin/photocardCtrl'));
}