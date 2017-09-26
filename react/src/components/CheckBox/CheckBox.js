import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './CheckBox.scss';

export default class CheckBox extends Component {
  static propTypes = {
    checked: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
    children: PropTypes.any.isRequired,
  }

  static defaultProps = {
    checked: false,
    className: '',
    onChange: () => {}
  }

  static index = 0;

  constructor(props) {
    super(props);
    this.id = `checkbox${CheckBox.index++}`;
  }

  render() {
    const { checked, className, onChange, children } = this.props;
    return (
      <div className={[styles.container, className].join(' ')}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          id={this.id}
        />
        <label htmlFor={this.id}>
          <span />
          {children}
        </label>
      </div>
    );
  }
}
