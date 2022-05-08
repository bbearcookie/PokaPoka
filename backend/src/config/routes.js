module.exports = (app) => {
  app.use('/test', require('../routes/testCtrl'));
  app.use('/api/auth', require('../routes/authCtrl'));
  app.use('/api/payment', require('../routes/paymentCtrl'));
  app.use('/api/sms', require('../routes/smsCtrl'));
  app.use('/api/suggestion', require('../routes/suggestionCtrl'));
  app.use('/api/notice', require('../routes/noticeCtrl'));
  app.use('/api/finding', require('../routes/findingCtrl'));
  app.use('/api/voucher', require('../routes/voucherCtrl'));
  app.use('/api', require('../routes/groupCtrl'));
  app.use('/api', require('../routes/memberCtrl'));
  app.use('/api', require('../routes/albumCtrl'));
  app.use('/api', require('../routes/photocardCtrl'));
  app.use('/api', require('../routes/tradeCtrl'));
}