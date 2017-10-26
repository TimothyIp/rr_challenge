import React from 'react';

const Alert = ({ header, content }) => {
  return(
    <div>
      <h3>{header}</h3>
      <p>{content}</p>
    </div>
  )
}

export default Alert;