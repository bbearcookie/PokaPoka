import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import ShippingProvisionList from '../../../components/list/ShippingProvisionList';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Button from '../../../components/form/Button';
import AdminTemplate from '../../../templates/AdminTemplate';
import './ShippingProvisionListPage.scss';

// 포토카드 배송 내역 조회 페이지
const ShippingProvisionListPage = () => {
  const request = useRequest();
  const [provisions, setProvisions] = useState([]);
  const navigate = useNavigate();

  // 화면 로드시 작동
  const onLoad = async (e) => {
    try {
      const res = await request.call(api.getShippingProvisionListAll);
      setProvisions(res.provisions);
      console.log(res);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <AdminTemplate className="ShippingProvisionListPage">
      {request.loading ? <LoadingSpinner /> : null}
      <section className="title_area">
        <h1 className="title-label">포토카드 배송 내역</h1>
      </section>

      <ShippingProvisionList provisions={provisions} perPage="10" />

    </AdminTemplate>
  );
};

export default ShippingProvisionListPage;