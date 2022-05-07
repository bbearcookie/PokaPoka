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
        className={classNames("link", {"active": URI.includes('/stoarage/permanent')})}
        to="/stoarage/permanent"
      >정식 소유권</Link>
      <Link
        className={classNames("link", {"active": URI.includes('/stoarage/temporal')})}
        to="/stoarage/temporal"
      >임시 소유권</Link>
    </SidebarTemplate>
  );
};

export default PhotoStoarageSidebar;