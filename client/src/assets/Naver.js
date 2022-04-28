import React from "react";

// 네이버 로고 SVG를 컴포넌트화 한 것
function Icon({ className, fill}) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 200 200">
      <path
        fill={fill}
        d="M115.9 145.8L83.7 98.4 83.7 145.8 50 145.8 50 54.3 84.2 54.3 116.4 101.6 116.4 54.3 150 54.3 150 145.8 115.9 145.8z"
        className="logo"
      ></path>
    </svg>
  );
}

Icon.defaultProps = {
  className: undefined,
  fill: '#1ec800'
};

export default Icon;