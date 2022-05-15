import React, { useState, createRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import useRequest from '../utils/useRequest';
import * as api from '../utils/api';
import './payment.scss';

const options = { withCredentials: true };
const recaptchaRef = createRef();

const Payment = ({users, vouchers}) => {
  const navigate = useNavigate();
  const request = useRequest();
  const [payResult, setPayResult] = useState(null);
  const [captchaed, setCaptchaed] = useState(null);
  const [message, setMessage] = useState('');

  const onClickButton = async () => {
    if (!captchaed) { setMessage('captcha 인증을 먼저 해주세요!'); return; }
    setMessage('');

    console.log('선택한 소유권 확인: '+vouchers.useVoucher);

    try {
      const payment = {
        pg: 'inicis',
        pay_method: 'card',
        amount: 10,
        name: '테스트 결제',
        buyer_name: users.name,
        buyer_tel: users.phone,
        buyer_email: '',
        buyer_addr: users.address,
        buyer_postcode: '06018',
      };

      // 백엔드 서버에 거래 데이터 생성 요청
      //const res = await request.call(api.postPayment, payment, vouchers);
      const res = await axios.post("http://localhost:5000/api/payment/mypage/request", { payment }, options);
      console.log(res.data.payment);
      

      // 아임포트 서버에 거래 요청
      const { IMP } = window;
      IMP.init(res.data.impcode);
      IMP.request_pay(res.data.payment, async (response) => {
        const { success, imp_uid, merchant_uid, error_msg } = response;
        console.log(response);

        if (success) {
          //결제 성공 시 배송할 소유권 등록
          const res2 = await request.call(api.postShippingWant, vouchers, merchant_uid);
          // 결제 성공시 거래가 위변조 없이 잘 성사되었는지 백엔드 서버에 검증 요청
          console.log("결제 성공");
          const res = await axios.post(
            'http://localhost:5000/api/payment/mypage/complete',
            { imp_uid, merchant_uid },
            options
          );
          setPayResult(JSON.stringify(res));
          console.log(res);
          navigate('/mypage/shipping');
        } else {
          console.log("결제 실패: " + error_msg);

          // 사용자가 결제를 취소했을 때에는 백엔드 서버에 저장된 거래 데이터 제거 요청
          if (error_msg === '사용자가 결제를 취소하셨습니다') {
            await axios.delete(`http://localhost:5000/api/payment/mypage/${merchant_uid}`, options);
          }
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  const onChangeCaptcha = (value) => {
    setCaptchaed(value);
    setMessage('');
  }

  const onClickTest = async () => {
    const res = await axios.post('http://localhost:5000/api/test');
    console.log(res);
  }

  return (
    <div className='Payment'>
      <h1 className='label'>captcha 테스트</h1>
      {captchaed ? <b>인증 성공!</b> : null}
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey="6LewjfUeAAAAANz5GLEO04XX9GMPe_mlq-mmFas_"
        onChange={onChangeCaptcha}
      />
      <hr />
      <h1 className='label'>결제 테스트</h1>
      {payResult ? <b>결제 성공!</b> : null}
      <p>{payResult}</p>
      {vouchers ? <button className='payment_button' type="button" onClick={onClickButton}>결제하기</button>: <p>배송할 소유권을 선택해주세요</p>}
    </div>
  );
};

export default Payment;