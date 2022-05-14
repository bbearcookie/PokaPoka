import React from 'react';
import qs from 'qs';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import SidebarTemplate from '../../templates/SidebarTemplate';

// 포토카드 교환 사이드바
const TradeSidebar = () => {
  const URI = window.location.pathname;
  const { backURI } = qs.parse(window.location.search, { ignoreQueryPrefix: true });

  return (
    <SidebarTemplate>
      <section className="title_section">포토카드 교환</section>
      <Link
        className={classNames("link",
        {"active": URI.includes('/trade/all')},
        {"active": backURI && backURI.includes('/trade/all')}
        )}
        to="/trade/all"
      >전체 교환글</Link>
      <Link
        className={classNames("link",
        {"active": URI.includes('/trade/favorite')},
        {"active": backURI && backURI.includes('/trade/favorite')}
        )}
        to="/trade/favorite"
      >찜한 교환글</Link>
      <Link
        className={classNames("link",
        {"active": URI.includes('/trade/explore')},
        {"active": backURI && backURI.includes('/trade/explore')}
        )}
        to="/trade/explore"
      >교환 탐색</Link>
      <Link className="link" to="#">교환 내역</Link>
    </SidebarTemplate>
  );
};

export default TradeSidebar;