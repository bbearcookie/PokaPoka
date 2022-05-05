import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import './SuggestionCard.scss';

const SuggestionCard = ({ className, id, title }) => {
  return (
    <Link className={classNames("SuggestionCard", className)} to={`/admin/suggestion/detail/${id}`}>
      <img 
        width="100%"
        height="200px"
        alt="문의사항"
      />
      <p className="name-label">{title}</p>
    </Link>
  );
};

SuggestionCard.defaultProps = {
  title: '문의사항 제목'
}

export default SuggestionCard;