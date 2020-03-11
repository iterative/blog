import cx from 'classnames';
import React from 'react';

import styles from './styles.module.css';

interface IHamburgerProps {
  open: boolean;
}

export default function Hamburger({ open }: IHamburgerProps) {
  return (
    <div className={styles.wrapper} hidden={!open}>
      <div className={cx(styles.line, styles.first, open && styles.open)} />
      <div className={cx(styles.line, styles.second, open && styles.open)} />
      <div className={cx(styles.line, styles.third, open && styles.open)} />
    </div>
  );
}
