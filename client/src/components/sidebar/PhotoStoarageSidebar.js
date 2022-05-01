import React from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import SidebarTemplate from '../../templates/SidebarTemplate';

const PhotoStoarageSidebar = () => {
  const URI = window.location.pathname;

  return (
    <SidebarTemplate>
      <section className="title_section">포토카드 보관함</section>
      <article className={classNames("link", {"active": URI === '/main'})}>
        <NavLink to="#">보유한 포토카드</NavLink>
      </article>
      <article className="link">
        <NavLink to="#">찜한 포토카드</NavLink>
      </article>
      <article className="link">
        <NavLink to="#">교환 진행 상황</NavLink>
      </article>
      <article className="link">
        <NavLink to="#">발급 진행 상황</NavLink>
      </article>
    </SidebarTemplate>
  );
};

export default PhotoStoarageSidebar;