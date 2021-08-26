import React from 'react';

//***** Common component for error message */
export default function ErrorMessage({text, className = 'error-line', style}) {
  return (
    <div className={className}>
      <p
        style={{
          ...{
            fontSize: 13,
            letterSpacing: 0,            
            textAlign: 'left',
            color: '#ff2929',
            paddingLeft: 4,
          },
          ...style,
        }}
      >
        {text}
      </p>
    </div>
  );
}
