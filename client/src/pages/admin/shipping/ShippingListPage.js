import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ShippingRequestList from '../../../components/list/ShippingRequestList';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import Button from '../../../components/form/Button';
import LoadingSpinner from '../../../components/LoadingSpinner';
import AdminTemplate from '../../../templates/AdminTemplate';
import './ShippingListPage.scss';

const ShippingListPage = () => {
  const request = useRequest();
  const [requests, setRequests] = useState([]);

  // 화면 로드시 작동
  const onLoad = async (e) => {
    try {
      const res = await request.call(api.getShippingRequestList);
      setRequests(res.request);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <AdminTemplate className="ShippingRequestListPage">
      <section className="title_area">
        <h1 className="title-label">포토카드 배송 요청</h1>
        <Link to="/mypage/shipping/request">
          <Button className="add_button">추가</Button>
        </Link>
      </section>

      <ShippingRequestList requests={requests} perPage="10" />

    </AdminTemplate>
  );
};

export default ShippingListPage;