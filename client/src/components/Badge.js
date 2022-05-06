import React from 'react';
import classNames from 'classnames';
import './Badge.scss';

// 뱃지의 타입에 따라 화면에 보여줄 텍스트
const TYPES = {
  'normal': '기타',
  'shipping': '배송',
  'voucher': '소유권',
  'contents': '데이터',
  'trade': '거래',
  'waiting': '대기중',
  'commented': '완료'
}

// 뱃지 컴포넌트
const Badge = ({ className, type }) => {
  return (
    <span className={classNames('Badge', className)} type={type}>{TYPES[type]}</span>
  );
};

export default Badge;