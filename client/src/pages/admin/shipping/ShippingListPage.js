import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import Button from '../../../components/form/Button';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ShippingProvisionList from '../../../components/list/ShippingProvisionList';
import ShippingRequestList from '../../../components/list/ShippingRequestList';
import AdminTemplate from '../../../templates/AdminTemplate';
import './ShippingListPage.scss';

const ShippingListPage = () => {
  const request = useRequest();
  const [message, setMessage] = useState('');
  const [requests, setRequests] = useState([]);
  const [provisions, setProvisions] = useState([]);

  // 화면 로드시 작동
  const onLoad = async (e) => {
    try {
      const res = await request.call(api.getShippingRequestList);
      setRequests(res.request);

      const res2 = await request.call(api.getShippingProvisionListAll);
      setProvisions(res2.provisions);
      console.log(res2);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <AdminTemplate className="ShippingRequestListPage">
    {request.loading ? <LoadingSpinner /> : null}

      <section className="title_area">
        <h1 className="title-label">포토카드 배송 요청 목록</h1>
      </section>
      <ShippingRequestList requests={requests} perPage="10" />

      <section className="title_area">
        <h1 className="title-label">포토카드 배송 내역</h1>
      </section>
      <ShippingProvisionList provisions={provisions} perPage="10" />

    </AdminTemplate>
  );
};

export default ShippingListPage;