import React from 'react';
import styled from 'styled-components';
import { Popover, PopoverBody } from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faQuestionCircle from '@fortawesome/fontawesome-free-regular/faQuestionCircle';

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
        <FontAwesomeIcon id={this.id} icon={faQuestionCircle} size="lg" onClick={this.toggle} />
        <Popover placement={placement || 'top-start'} isOpen={this.state.isOpen} target={this.id} toggle={this.toggle}>
          <PopoverBody>{label}</PopoverBody>
        </Popover>
      </Wrapper>
    );
  }
}

export default HelpIcon;
