import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import './GroupCard.scss';

const GroupCard = ({ className, id, src, name }) => {
  return (
    <Link className={classNames("GroupCard", className)} to={`/admin/group/detail/${id}`}>
      <img 
        width="100%"
        height="200px"
        src={src ? src : '/no_image.jpg'}
        onError={e => e.target.src = '/no_image.jpg'}
        alt="그룹"
      />
      <p className="name-label">{name}</p>
    </Link>
  );
};

GroupCard.defaultProps = {
  name: '그룹 이름'
}

export default GroupCard;