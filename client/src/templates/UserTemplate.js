import React from 'react';
import classNames from 'classnames';
import Navbar from '../components/Navbar';
import './UserTemplate.scss';

const UserTemplate = ({ className, sidebar, children }) => {
  return (
    <div className="UserTemplate">
      <Navbar />
      <section className="middle_section">
        {sidebar}
        <section className={classNames("content_section", className)}>
          {children}
        </section>
      </section>
    </div>
  );
};

export default UserTemplate;