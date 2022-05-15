import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import SidebarTemplate from '../../templates/SidebarTemplate';

// 관리자 페이지 사이드바
const AdminSidebar = () => {
  const URI = window.location.pathname;

  return (
    <SidebarTemplate>
      <section className="title_section">관리자 페이지</section>
      <section className="subtitle_section">사용자 관리</section>
      <Link 
        className={classNames("link", {"active": URI.includes('/admin/user')})}
        to="/admin/user">사용자</Link>
      <section className="subtitle_section">커뮤니티 관리</section>
      <Link 
        className={classNames("link", {"active": URI.includes('/admin/notice')})}
        to="/admin/notice">공지사항</Link>
      <Link
        className={classNames("link", {"active": URI.includes('/admin/suggestion')})}
        to="/admin/suggestion">문의사항</Link>
      <section className="subtitle_section">포토카드 교환 관리</section>
      <Link
        className={classNames("link", {"active": URI.includes('/admin/voucher/request')})}
        to="/admin/voucher/request"
      >소유권 요청</Link>
      <Link
        className={classNames("link", {"active": URI.includes('/admin/voucher/provision')})}
        to="/admin/voucher/provision"
      >소유권 발급</Link>
      <Link className={classNames("link", {"active": URI.includes('/admin/shipping')})}
        to="/admin/shipping">배송 요청</Link>
      <section className="subtitle_section">DB 데이터 관리</section>
      <Link
        className={classNames("link", {"active": URI.includes('/admin/group')})}
        to="/admin/group"
      >아이돌 관리</Link>
      <Link
        className={classNames("link", {"active": URI.includes('/admin/photocard')})}
        to="/admin/photocard"
      >포토카드 관리</Link>
    </SidebarTemplate>
  );
};

export default AdminSidebar;