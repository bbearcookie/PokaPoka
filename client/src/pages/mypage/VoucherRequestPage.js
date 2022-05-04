import React from 'react';
import UserTemplate from '../../templates/UserTemplate';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import './VoucherRequestPage.scss';

const VoucherRequestPage = () => {
  return (
    <UserTemplate
      className="VoucherRequestPage"
      sidebar={<MyPageSidebar />}
    >
      <p>포토카드 소유권 발급 페이지</p>
    </UserTemplate>
  );
};

export default VoucherRequestPage;