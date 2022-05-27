import React from 'react';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="Footer">
      <p className="label white">
        <b className="">PokaPoka</b> | 아이돌 포토카드 교환 플랫폼
      </p>
      <br />
      <p className="label">Maintainers 배재혁 김류연 이상훈 조현영</p>
      <p className="label">Address 경기도 성남시 수정구 성남대로 1342 가천대학교 창업보육센터 | Postcode 13120</p>
      <p className="label">Contact 010-5332-9696</p>
      <br />
      <p className="label">Copyright 2022. PokaPoka inc. all rights reserved.</p>
    </footer>
  );
};

export default Footer;