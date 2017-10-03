import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import './Header.scss';

const titleImage = require('assets/title.png');

export default class Header extends Component {

  static propTypes = {
    pathname: PropTypes.string.isRequired,
    menuData: PropTypes.array,
    permission: PropTypes.number,
  };

  static defaultProps = {
    menuData: [],
    permission: 0,
  }

  renderSubMenus = item => {
    const active = item.menuData.filter(subitem => subitem.to === this.props.pathname).length > 0;
    return (
      <NavDropdown
        key={item.id}
        id={item.id}
        title={item.label}
        className={active ? 'active' : ''}
      >
        {
          item.menuData.map(subitem => {
            const permission = subitem.permission || 0;

            if (subitem.func) {
              return (
                <MenuItem
                  key={subitem.id}
                  disabled={this.props.permission < permission}
                  onClick={() => subitem.func()}>
                  {subitem.label}
                </MenuItem>
              );
            }

            return (
              this.props.permission < permission ?
                <MenuItem key={subitem.id} disabled>{subitem.label}</MenuItem> :
                <LinkContainer key={subitem.id} to={subitem.to}>
                  <MenuItem>{subitem.label}</MenuItem>
                </LinkContainer>
            );
          })
        }
      </NavDropdown>
    );
  }

  renderMenus = (menuData, kind) => menuData.map(item => {
    if ((item.kind || 'left') !== kind) {
      return '';
    }

    if (item.menuData) {
      return this.renderSubMenus(item);
    }

    const permission = item.permission || 0;
    if (item.func) {
      return (
        <NavItem
          key={item.id}
          disabled={this.props.permission < permission}
          onClick={() => item.func()}
        >
          {item.label}
        </NavItem>
      );
    }
    return (
      <LinkContainer key={item.id} to={item.to}>
        <NavItem
          disabled={this.props.permission < permission}
        >{item.label}</NavItem>
      </LinkContainer>
    );
  });

  render() {
    return (
      <Navbar inverse fixedTop collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">
              <img src={titleImage} alt="" />
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            { this.renderMenus(this.props.menuData || [], 'left') }
          </Nav>
          <Nav pullRight>
            { this.renderMenus(this.props.menuData || [], 'right') }
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
