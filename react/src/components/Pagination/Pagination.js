import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { COUNT_PER_PAGE } from 'const';
import { Link } from 'react-router';
import styles from './Pagination.scss';

export default class Pagination extends Component {

  static propTypes = {
    total: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    countPerPage: PropTypes.number,
    onSelect: PropTypes.func.isRequired,
  }

  static defaultProps = {
    countPerPage: COUNT_PER_PAGE,
  }

  render() {
    const { total, index, countPerPage, onSelect } = this.props;
    const pCount = Math.ceil(total / countPerPage);
    let firstIndex = Math.max(0, index - 2);
    let lastIndex = firstIndex + 4;
    if (lastIndex >= pCount) {
      lastIndex = pCount - 1;
      firstIndex = Math.max(0, lastIndex - 4);
    }

    const buttons = [];
    for (let i = firstIndex; i <= lastIndex; i++) {
      buttons.push(
        i === index ?
          <span key={i}>{i + 1}</span>
        :
          <Link key={i} onClick={() => onSelect(i)}>{i + 1}</Link>
      );
    }

    return (
      <div className={styles.pagination}>
        {
          index !== 0 &&
          <Link onClick={() => onSelect(index - 1)}>
            <i className="fa fa-angle-left fa-lg"></i> Previous
          </Link>
        }
        { buttons }
        {
          index !== lastIndex &&
          <Link onClick={() => onSelect(index + 1)}>
            Next <i className="fa fa-angle-right fa-lg"></i>
          </Link>
        }
      </div>
    );
  }
}
