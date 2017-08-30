import React from 'react';
import styles from './Items.scss';

// eslint-disable-next-line react/prop-types
export function JobItem({ image, name, comment, className }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
      className={className}
    >
      <img
        style={{ padding: '5px' }}
        src={image}
        width="80"
        height="80"
        alt=""
      />
      <div className={styles.content} >
        <div style={{ fontSize: '22px' }}>{name}</div>
        <div className={styles.comment} >{comment}</div>
      </div>
    </div>
  );
}
