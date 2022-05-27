import React from 'react';
import classNames from 'classnames';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './UserTemplate.scss';

const UserTemplate = ({ className, sidebar, children }) => {
  return (
    <>
      <div className="UserTemplate">
        <Navbar />
        <section className="middle_section">
          {sidebar}
          <section className={classNames("content_section", className)}>
            {children}
          </section>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default UserTemplate;