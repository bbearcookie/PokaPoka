import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import './MemberCard.scss';

const MemberCard = ({ className, id, src, name }) => {
  return (
    <Link className={classNames("MemberCard", className)} to={`/admin/member/detail/${id}`}>
      <img 
        width="100%"
        height="200px"
        src={src ? src : '/no_image.jpg'}
        onError={e => e.target.src = '/no_image.jpg'}
        alt="멤버"
      />
      <p className="name-label">{name}</p>
    </Link>
  );
};

MemberCard.defaultProps = {
  name: '멤버 이름'
}

export default MemberCard;