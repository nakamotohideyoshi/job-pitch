import React from 'react';
import styled from 'styled-components';
import Select from 'react-select';

import { Logo } from 'components';
import * as helper from 'utils/helper';

const Wrapper = styled(Select)`
  &.Select.Select--single {
    .Select-control {
      .Select-placeholder,
      .Select-value,
      .Select-input {
        height: 60px;
        line-height: 60px;
        padding-right: 30px;
      }

      .logo {
        width: 40px;
        height: 40px;
        margin-top: 10px;
        padding: 0;
        margin-right: 10px;
        float: left;
      }
    }

    .Select-option {
      .logo {
        width: 40px;
        height: 40px;
        padding: 0;
        margin-right: 10px;
        vertical-align: middle;
      }
    }
  }
`;

class OptionComponent extends React.PureComponent {
  handleMouseDown = event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onSelect(this.props.option, event);
  };

  handleMouseEnter = event => {
    this.props.onFocus(this.props.option, event);
  };

  handleMouseMove = event => {
    if (this.props.isFocused) return;
    this.props.onFocus(this.props.option, event);
  };

  render() {
    const business = this.props.option;
    const logo = helper.getBusinessLogo(business);
    const tn = business.tokens;
    const tokenCount = `${tn} credit${tn !== 1 ? 's' : ''}`;
    return (
      <div
        className={this.props.className}
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}
      >
        <Logo src={logo} className="logo" />
        {this.props.children}
        {` (${tokenCount})`}
      </div>
    );
  }
}

class ValueComponent extends React.PureComponent {
  render() {
    const business = this.props.value;
    const logo = helper.getBusinessLogo(business);
    const tn = business.tokens;
    const tokenCount = `${tn} credit${tn !== 1 ? 's' : ''}`;
    return (
      <div className="Select-value">
        <span className="Select-value-label">
          <Logo src={logo} className="logo" />
          {this.props.children}
          {` (${tokenCount})`}
        </span>
      </div>
    );
  }
}

const BusinessSelect = props => (
  <Wrapper {...props} optionComponent={OptionComponent} valueComponent={ValueComponent} />
);

export default BusinessSelect;
