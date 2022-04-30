import React from 'react';
import classNames from 'classnames';
import './Select.scss';

const Select = React.forwardRef(({ className, name, children, onChange }, ref) => {
  return (
    <select
      className={classNames('Select', className)}
      name={name}
      onChange={onChange}
      ref={ref}
    >
      {children}
    </select>
  );
});

Select.defaultProps = {
  onChange: () => {}
}

export default Select;