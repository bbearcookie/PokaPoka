import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/form/Button';
import UserTemplate from '../../templates/UserTemplate';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import './VoucherRequestListPage.scss';

const VoucherRequestListPage = () => {
  return (
    <UserTemplate
      className="VoucherRequestListPage"
      sidebar={<MyPageSidebar />}
    >
      <section className="title_area">
        <h1 className="title-label">포토카드 소유권 발급 요청</h1>
        <Link to="/mypage/voucher/writer">
          <Button className="add_button">추가</Button>
        </Link>
      </section>
    </UserTemplate>
  );
};

export default VoucherRequestListPage;