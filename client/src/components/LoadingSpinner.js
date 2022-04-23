import React from 'react';
import './LoadingSpinner.scss';

// 화면에 로딩 화면을 보여줘야 할 때 사용하는 컴포넌트
const LoadingSpinner = () => {
  return (
    <div className="LoadingSpinnerWrapper">
      <div className="LoadingSpinner">
      </div>
    </div>
  );
};

export default LoadingSpinner;