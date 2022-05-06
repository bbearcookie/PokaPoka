import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import VoucherRequestList from '../../../components/list/VoucherRequestList';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Button from '../../../components/form/Button';
import AdminTemplate from '../../../templates/AdminTemplate';
import './VoucherRequestListPage.scss';

// 포토카드 소유권 발급 요청 목록 조회 페이지
const VoucherRequestListPage = () => {
  const request = useRequest();
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  // 화면 로드시 작동
  const onLoad = async (e) => {
    try {
      const res = await request.call(api.getVoucherRequestListAll);
      setRequests(res.requests);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <AdminTemplate className="VoucherRequestListPage">
      {request.loading ? <LoadingSpinner /> : null}
      <section className="title_area">
        <h1 className="title-label">포토카드 소유권 발급 요청 목록</h1>
      </section>

      <VoucherRequestList requests={requests} perPage="10" />

    </AdminTemplate>
  );
};

export default VoucherRequestListPage;