import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Container
} from 'reactstrap';
import { FormComponent } from 'components';

import { confirm } from 'redux/common';
import { logout } from 'redux/auth';
import { MENU_DATA, SDATA } from 'utils/data';
import * as helper from 'utils/helper';
import titleImage from 'assets/title.png';
import Wrapper from './Wrapper';

class Header extends React.Component {
  state = {
    isOpen: false
  };

  handleClickMenuItem = to => {
    const { confirm, logout } = this.props;

    this.setState({ isOpen: false });

    if (to !== 'signout') {
      helper.routePush(to, this.props);
      return;
    }

    confirm('Confirm', 'Are you sure you want to sign out?', [
      { outline: true },
      {
        label: 'Sign out',
        color: 'green',
        onClick: () => {
          FormComponent.modified = false;
          logout();
        }
      }
    ]);
  };

  handleToggle = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  checkActive = item => {
    const { pathname } = this.props.location;
    let to = item.to || '';
    if (to.slice(-1) === '/') {
      to = to.slice(0, -1);
      return pathname.indexOf(to) === 0;
    }
    return pathname === to;
  };

  renderSubMenu = info => {
    const filters = info.items.filter(item => this.checkActive(item));
    const active = filters.length > 0 ? 'active' : '';
    const label = info.label === 'email' ? SDATA.user.email : info.label;
    return (
      <UncontrolledDropdown nav className={active} key={label} inNavbar>
        <DropdownToggle nav caret>
          {label}
        </DropdownToggle>
        <DropdownMenu>
          {info.items.map(item => {
            if (item.permission > this.props.permission) {
              return '';
            }

            if (item.label === undefined) {
              return <DropdownItem divider key={new Date().getTime()} />;
            }

            return (
              <DropdownItem
                key={item.label}
                active={this.checkActive(item)}
                onClick={() => this.handleClickMenuItem(item.to)}
              >
                {item.label}
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  };

  renderMenu = info => {
    if (info.permission > this.props.permission) {
      return '';
    }

    if (info.items) {
      return this.renderSubMenu(info);
    }

    return (
      <NavItem key={info.label} active={this.checkActive(info)}>
        {info.to && <Link to={info.to}>{info.label}</Link>}
        {info.href && <NavLink href={info.href}>{info.label}</NavLink>}
      </NavItem>
    );
  };

  render() {
    const { left, right } = MENU_DATA[this.props.loginState];

    return (
      <Wrapper>
        <Navbar dark expand="md" fixed="top">
          <Container>
            <NavLink href="https://www.myjobpitch.com/" className="navbar-brand">
              <img src={titleImage} alt="" />
            </NavLink>

            <NavbarToggler onClick={this.handleToggle} />

            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav navbar>{left.map(this.renderMenu)}</Nav>
              <Nav className="ml-auto" navbar>
                {right.map(this.renderMenu)}
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
      </Wrapper>
    );
  }
}

export default withRouter(
  connect(
    state => ({
      loginState: state.auth.loginState,
      permission: state.auth.permission
    }),
    { logout, confirm }
  )(Header)
);
