import React from 'react';
import classNames from 'classnames';
import { BACKEND } from '../../utils/api';
import './GroupCard.scss';

const GroupCard = ({ className, src, name }) => {
  return (
    <article className={classNames("GroupCard", className)}>
      <img 
        width="100%"
        height="200px"
        src={src ? src : '/no_image.jpg'}
        onError={e => e.target.src = '/no_image.jpg'}
        alt="그룹"
      />
      <p className="name-label">{name}</p>
  </article>
  );
};

GroupCard.defaultProps = {
  name: '그룹 이름'
}

export default GroupCard;