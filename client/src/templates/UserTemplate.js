import React from 'react';
import classNames from 'classnames';
import Navbar from '../components/Navbar';
import './UserTemplate.scss';

const UserTemplate = ({ className, sidebar, children }) => {
  return (
    <div className={classNames("UserTemplate", className)}>
      <Navbar />
      <section className="middle_section">
        {sidebar}
        <section className="content_section">
          {children}
        </section>
      </section>
    </div>
  );
};

export default UserTemplate;