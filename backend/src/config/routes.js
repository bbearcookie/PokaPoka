module.exports = (app) => {
  app.use('/test', require('../routes/testCtrl'));
  app.use('/api/auth', require('../routes/authCtrl'));
  app.use('/api/payment', require('../routes/paymentCtrl'));
  app.use('/api/photo', require('../routes/photoCtrl'));
  app.use('/api/sms', require('../routes/smsCtrl'));
  app.use('/api/suggestion', require('../routes/suggestionCtrl'));
  app.use('/api/trade', require('../routes/tradeCtrl'));

  //아이디 비밀 번호 찾기
  app.use('/api/finding', require('../routes/findingCtrl'));
}