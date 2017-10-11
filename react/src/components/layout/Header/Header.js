import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { FormComponent } from 'components';
import * as commonActions from 'redux/modules/common';
import './Header.scss';

const titleImage = require('assets/title.png');

@connect(
  () => ({
  }),
  { ...commonActions }
)
export default class Header extends Component {
  static propTypes = {
    alertShow: PropTypes.func.isRequired,
    pathname: PropTypes.string.isRequired,
    menuData: PropTypes.array,
    permission: PropTypes.number,
  };

  static defaultProps = {
    menuData: [],
    permission: 0,
  }

  onClickItem = item => {
    if (FormComponent.needToSave) {
      this.props.alertShow(
        'Confirm',
        'You did not save your changes.',
        [
          {
            label: 'Ok',
            style: 'success',
            callback: () => {
              FormComponent.needToSave = false;
              if (item.func) {
                item.func();
              } else {
                browserHistory.push(item.to);
              }
            }
          },
          { label: 'Cancel' },
        ]
      );
    } else if (item.func) {
      item.func();
    } else {
      browserHistory.push(item.to);
    }
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
            const disabled = this.props.permission < (subitem.permission || 0);
            return (
              <MenuItem
                key={subitem.id}
                active={this.props.pathname.indexOf(subitem.to) !== -1}
                disabled={disabled}
                onClick={disabled ? () => {} : () => this.onClickItem(subitem)}
              >
                {subitem.label}
              </MenuItem>
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

    return (
      <NavItem
        key={item.id}
        active={this.props.pathname.indexOf(item.to) !== -1}
        disabled={this.props.permission < (item.permission || 0)}
        onClick={() => this.onClickItem(item)}
      >{item.label}</NavItem>
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
