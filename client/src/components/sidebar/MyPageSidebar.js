import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import SidebarTemplate from '../../templates/SidebarTemplate';

// 마이 페이지 사이드바
const MyPageSidebar = () => {
  const URI = window.location.pathname;

  return (
    <SidebarTemplate>
      <section className="title_section">마이페이지</section>
      <section className="subtitle_section">정보 관리</section>
      <Link className="link" to="#">회원정보 관리</Link>
      <Link className="link" to="#">배송정보 관리</Link>
      <Link className="link" to="#">교환글 관리</Link>
      <section className="subtitle_section">관리자에게 요청</section>
      <Link 
        className={classNames("link", {"active": URI.includes('/mypage/suggestion')})}
        to="/mypage/suggestion">문의사항</Link>
      <Link
        className={classNames("link", {"active": URI.includes('/mypage/voucher')})}
        to="/mypage/voucher">포토카드 소유권</Link>
      <Link className="link" to="#">포토카드 배송</Link>
    </SidebarTemplate>
  );
};

export default MyPageSidebar;