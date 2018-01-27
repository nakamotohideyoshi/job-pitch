import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Wrapper from './Wrapper';

class Checkbox extends Component {
  static propTypes = {
    checked: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
    label: PropTypes.string
  };

  static defaultProps = {
    checked: false,
    className: '',
    children: '',
    onChange: () => {}
  };

  static index = 0;

  constructor(props) {
    super(props);
    this.id = `checkbox${Checkbox.index++}`;
  }

  render() {
    const { checked, className, onChange, label } = this.props;
    return (
      <Wrapper className={className}>
        <input type="checkbox" checked={checked} onChange={onChange} id={this.id} />
        <label htmlFor={this.id}>
          <span />
          <div>{label}</div>
        </label>
      </Wrapper>
    );
  }
}

export default Checkbox;
