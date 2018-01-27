import React from 'react';
import styled from 'styled-components';
import { Popover, PopoverBody } from 'reactstrap';

const Wrapper = styled.span`
  color: #ff9300;
  margin: 0 10px;
`;

class HelpIcon extends React.PureComponent {
  static id = 0;

  state = { isOpen: false };

  componentWillMount() {
    HelpIcon.id++;
    this.id = `popover${HelpIcon.id}`;
  }

  toggle = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    const { className, style, placement, label } = this.props;

    return (
      <Wrapper className={className} style={style}>
        <i id={this.id} className="fa fa-question-circle-o fa-lg" onClick={this.toggle} />
        <Popover placement={placement || 'top-start'} isOpen={this.state.isOpen} target={this.id} toggle={this.toggle}>
          <PopoverBody>{label}</PopoverBody>
        </Popover>
      </Wrapper>
    );
  }
}

export default HelpIcon;
