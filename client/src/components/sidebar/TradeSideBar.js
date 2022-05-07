import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import SidebarTemplate from '../../templates/SidebarTemplate';

// 포토카드 교환 사이드바
const TradeSidebar = () => {
  const URI = window.location.pathname;

  return (
    <SidebarTemplate>
      <section className="title_section">포토카드 교환</section>
      <Link
        className={classNames("link", {"active": URI.includes('/trade/all')})}
        to="/trade/all"
      >전체 교환글</Link>
      <Link className="link" to="#">내 교환글</Link>
      <Link className="link" to="#">찜한 교환글</Link>
      <Link className="link" to="#">교환 탐색</Link>
    </SidebarTemplate>
  );
};

export default TradeSidebar;