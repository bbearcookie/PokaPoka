import React from 'react';
import classNames from 'classnames';
import './Table.scss';

const Table = ({ className, children }) => {
  return (
    <table className={classNames('Table', className)}>
      {children}
    </table>
  );
};

export default Table;