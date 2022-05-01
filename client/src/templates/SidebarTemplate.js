import React from 'react';
import classNames from 'classnames';
import './SidebarTemplate.scss';

const SidebarTemplate = ({ className, children }) => {
  return (
    <div className={classNames("SidebarTemplate", className)}>
      {children}
    </div>
  );
};

export default SidebarTemplate;