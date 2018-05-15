import React from 'react';
import styled from 'styled-components';
import { Input } from 'antd';
import { Icons } from 'components';

const Wrapper = styled(Input)`
  svg {
    color: #ccc;
  }
  .fa-times-circle:hover {
    color: #999;
    cursor: pointer;
  }
`;

class SearchBox extends React.PureComponent {
  state = {
    text: ''
  };

  componentWillMount() {
    this.setState({ text: this.props.defaultValue });
  }

  setText = text => {
    this.setState({ text });
    this.props.onChange(text);
  };

  clearText = () => {
    this.setText('');
    this.refInput.input.focus();
  };

  render() {
    const { text } = this.state;

    return (
      <Wrapper
        placeholder="Search"
        value={text}
        style={{ width: this.props.width || '100%' }}
        innerRef={node => (this.refInput = node)}
        prefix={<Icons.Search />}
        suffix={text ? <Icons.TimeCircle onClick={this.clearText} /> : null}
        onChange={e => this.setText(e.target.value)}
      />
    );
  }
}

export default SearchBox;
