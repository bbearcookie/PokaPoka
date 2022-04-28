import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import './AlbumCard.scss';

const AlbumCard = ({ className, groupId, id, src, name }) => {
  return (
    <Link className={classNames("AlbumCard", className)} to={`/admin/album/detail/${id}?groupId=${groupId}`}>
      <img 
        width="100%"
        height="200px"
        src={src ? src : '/no_image.jpg'}
        onError={e => e.target.src = '/no_image.jpg'}
        alt="앨범"
      />
      <p className="name-label">{name}</p>
    </Link>
  );
};

AlbumCard.defaultProps = {
  name: '멤버 이름'
}

export default AlbumCard;