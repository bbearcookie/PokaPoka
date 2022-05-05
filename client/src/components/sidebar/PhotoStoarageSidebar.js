import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import SidebarTemplate from '../../templates/SidebarTemplate';

// 포토카드 보관함 사이드바
const PhotoStoarageSidebar = () => {
  const URI = window.location.pathname;

  return (
    <SidebarTemplate>
      <section className="title_section">포토카드 보관함</section>
      <Link
        className={classNames("link", {"active": URI.includes('/main')})}
        to="#"
      >보유한 포토카드</Link>
      <Link className="link" to="#">찜한 포토카드</Link>
      <Link className="link" to="#">교환 진행 상황</Link>
    </SidebarTemplate>
  );
};

export default PhotoStoarageSidebar;