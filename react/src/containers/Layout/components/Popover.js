import React from 'react';
import styled from 'styled-components';
import { Popover } from 'antd';

export const MenuButton = styled.div`
  padding: 0 10px;
  color: #999999;
  transition: color 0.3s;
  font-size: 20px;
  cursor: pointer;

  &:hover {
    color: #fff;
  }
`;

class HeaderPopover extends React.Component {
  state = {
    visible: false
  };

  show = visible => this.setState({ visible });

  hide = () => this.setState({ visible: false });

  render() {
    const { float, icon: Icon, menu: Menu } = this.props;
    const placement = float === 'left' ? 'bottomLeft' : 'bottomRight';

    return (
      <Popover
        placement={placement}
        visible={this.state.visible}
        onVisibleChange={this.show}
        content={<Menu theme="light" mode="inline" onClick={this.hide} />}
        trigger="click"
        overlayStyle={{ position: 'fixed' }}
      >
        <MenuButton style={{ float }}>
          <Icon />
        </MenuButton>
      </Popover>
    );
  }
}

export default HeaderPopover;
