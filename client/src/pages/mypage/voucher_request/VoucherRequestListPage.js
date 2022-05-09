import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VoucherRequestList from '../../../components/list/VoucherRequestList';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import Button from '../../../components/form/Button';
import LoadingSpinner from '../../../components/LoadingSpinner';
import UserTemplate from '../../../templates/UserTemplate';
import MyPageSidebar from '../../../components/sidebar/MyPageSidebar';
import './VoucherRequestListPage.scss';

const VoucherRequestListPage = () => {
  const request = useRequest();
  const [requests, setRequests] = useState([]);

  // 화면 로드시 작동
  const onLoad = async (e) => {
    try {
      const res = await request.call(api.getVoucherRequestListMine);
      setRequests(res.requests);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <UserTemplate
      className="VoucherRequestListPage"
      sidebar={<MyPageSidebar />}
    >
      <section className="title_area">
        <h1 className="title-label">포토카드 소유권 요청</h1>
        <Link to="/mypage/voucher/writer">
          <Button className="add_button">추가</Button>
        </Link>
      </section>

      <VoucherRequestList requests={requests} perPage="10" />

    </UserTemplate>
  );
};

export default VoucherRequestListPage;