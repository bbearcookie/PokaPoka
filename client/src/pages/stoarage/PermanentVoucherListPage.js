import React from 'react';
import UserTemplate from '../../templates/UserTemplate';
import PhotoStoarageSidebar from '../../components/sidebar/PhotoStoarageSidebar';
import './PermanentVoucherListPage.scss';

const PermanentVoucherListPage = () => {
  return (
    <UserTemplate
      className="PermanentVoucherListPage"
      sidebar={<PhotoStoarageSidebar />}
    >
      <p>정식 소유권 보관함</p>
    </UserTemplate>
  );
};

export default PermanentVoucherListPage;