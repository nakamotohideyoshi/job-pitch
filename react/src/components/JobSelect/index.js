import React from 'react';
import styled, { css } from 'styled-components';
import Select from 'react-select';

import { Logo, Loading } from 'components';
import * as helper from 'utils/helper';

const Wrapper = styled.div`
  position: relative;

  ${props => css`
    .Select.Select--single {
      .Select-control {
        .Select-placeholder,
        .Select-value,
        .Select-input {
          height: ${props.size}px;
          line-height: ${props.size}px;
          padding-left: ${props.size / 6}px;
          padding-right: ${props.size / 3 + 10}px;
        }

        .Select-placeholder {
          padding-left: ${props.size / 3}px;
        }

        > *:last-child {
          padding-right: ${props.size / 6}px;
        }

        .logo {
          width: ${props.size * 2 / 3}px;
          height: ${props.size * 2 / 3}px;
          margin-top: ${props.size / 6}px;
          margin-right: ${props.size / 6}px;

          padding: 0;
          float: left;
        }
      }

      .Select-option {
        padding: ${props.size / 6}px;
        .logo {
          width: ${props.size * 2 / 3}px;
          height: ${props.size * 2 / 3}px;
          margin-right: ${props.size / 6}px;
          padding: 0;
          vertical-align: middle;
        }
      }
    }

    &.loading {
      pointer-events: none;
    }
  `};
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
    const logo = helper.getJobLogo(this.props.option);
    return (
      <div
        className={this.props.className}
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}
      >
        <Logo src={logo} className="logo" />
        {this.props.option.title}
      </div>
    );
  }
}

class ValueComponent extends React.Component {
  render() {
    const logo = helper.getJobLogo(this.props.value);
    return (
      <div className="Select-value">
        <span className="Select-value-label">
          <Logo src={logo} className="logo" />
          {this.props.value.title}
        </span>
      </div>
    );
  }
}

const JobSelect = props => {
  const { options, size, placeholder } = props;

  return (
    <Wrapper size={size || 33.5} className={!options ? 'loading' : ''}>
      <Select
        {...props}
        valueKey="id"
        placeholder={!options ? 'Loading...' : placeholder || 'Select a job...'}
        optionComponent={OptionComponent}
        valueComponent={ValueComponent}
      />
      {!options && <Loading size={size * 0.4} />}
    </Wrapper>
  );
};

export default JobSelect;
