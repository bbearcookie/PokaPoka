import React from "react";

// 카카오 로고 SVG를 컴포넌트화 한 것
function Icon({ className, width, height, fill }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      version="1.1"
      viewBox="0 0 99.618 92.147"
      xmlSpace="preserve"
    >
      <defs>
        <clipPath id="clipPath692" clipPathUnits="userSpaceOnUse">
          <path d="M0 595.28h841.89V0H0z"></path>
        </clipPath>
      </defs>
      <g transform="matrix(1 0 0 -1 -362.264 234.099)">
        <g clipPath="url(#clipPath692)">
          <g transform="translate(163.261 376.678)">
            <path
              fill={fill}
              fillOpacity="1"
              fillRule="nonzero"
              stroke="none"
              d="M248.81-143.579c-26.953 0-48.808-17.256-48.808-38.555 0-13.68 9.052-25.693 22.646-32.549l-4.599-17.167a1.42 1.42 0 01.352-1.465c.263-.265.614-.41.995-.41.294 0 .586.116.85.321l19.775 13.36a62.109 62.109 0 018.79-.644c26.952 0 48.81 17.255 48.81 38.554 0 21.3-21.858 38.555-48.81 38.555"
            ></path>
          </g>
        </g>
      </g>
    </svg>
  );
}

Icon.defaultProps = {
  className: undefined,
  width: "99.618",
  height: "92.147",
  fill: '#3c1e1e',
};

export default Icon;