import React from 'react';
import classNames from 'classnames';
import './MessageLabel.scss';

const MessageLabel = ({ className, children }) => {
  return (
    <p className={classNames("MessageLabel", className)}>
      {children}
    </p>
  );
};

export default MessageLabel;