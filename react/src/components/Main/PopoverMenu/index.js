import React from 'react';
import styled from 'styled-components';
import { Popover } from 'antd';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

const MenuButton = styled.div`
  padding: 0 10px;
  color: #999999;
  transition: color 0.3s;
  font-size: 20px;
  cursor: pointer;

  &:hover {
    color: #fff;
  }
`;

class PopoverMenu extends React.Component {
  state = {
    visible: false
  };

  handleVisibleChange = visible => this.setState({ visible });

  hide = () => this.setState({ visible: false });

  render() {
    const { float, icon, menu: Menu } = this.props;
    const placement = float === 'left' ? 'bottomLeft' : 'bottomRight';

    return (
      <Popover
        placement={placement}
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
        content={<Menu theme="light" mode="inline" onClick={this.hide} />}
        trigger="click"
      >
        <MenuButton style={{ float }}>
          <FontAwesomeIcon icon={icon} />
        </MenuButton>
      </Popover>
    );
  }
}

export default PopoverMenu;
