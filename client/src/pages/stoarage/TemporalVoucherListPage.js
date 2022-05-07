import React from 'react';
import UserTemplate from '../../templates/UserTemplate';
import PhotoStoarageSidebar from '../../components/sidebar/PhotoStoarageSidebar';
import './TemporalVoucherListPage.scss';

const TemporalVoucherListPage = () => {
  return (
    <UserTemplate
      className="TemporalVoucherListPage"
      sidebar={<PhotoStoarageSidebar />}
    >
      <p>임시 소유권 보관함</p>
    </UserTemplate>
  );
};

export default TemporalVoucherListPage;