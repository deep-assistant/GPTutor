import React from 'react';

export const MistralIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 512 512" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit="2"
  >
    <g transform="translate(6 79.299) scale(1.96335)">
      <clipPath id="prefix__a">
        <path d="M0 0h254.667v180H0z"/>
      </clipPath>
      <g clipPath="url(#prefix__a)">
        <g transform="scale(1.33333)">
          <clipPath id="prefix__b">
            <path d="M0 0h190.141v135H0z"/>
          </clipPath>
          <g clipPath="url(#prefix__b)" fillRule="nonzero">
            <path fill="#ffd800" d="M27.153 0h27.169v27.089H27.153zM135.815 0h27.169v27.089h-27.169z"/>
            <path fill="#ffaf00" d="M27.153 27.091h54.329V54.18H27.153zM108.661 27.091h54.329V54.18h-54.329z"/>
            <path fill="#ff8205" d="M27.153 54.168h135.819v27.089H27.153z"/>
            <path fill="#fa500f" d="M27.153 81.259h27.169v27.09H27.153zM81.492 81.259h27.169v27.09H81.492zM135.815 81.259h27.169v27.09h-27.169z"/>
            <path fill="#e10500" d="M-.001 108.339h81.489v27.09H-.001zM108.661 108.339h81.498v27.09h-81.498z"/>
          </g>
        </g>
      </g>
    </g>
  </svg>
);
