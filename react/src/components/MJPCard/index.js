import React from 'react';
import PropTypes from 'prop-types';
import {
  CardBody,
  CardTitle,
  CardText,
  CardFooter,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import Truncate from 'react-truncate';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEllipsisV from '@fortawesome/fontawesome-free-solid/faEllipsisV';

import Logo from '../tags/Logo';
import Loading from '../tags/Loading';
import Wrapper from './Wrapper';

class MJPCard extends React.PureComponent {
  state = {
    dropdownOpen: false
  };

  toggle = event => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
    event.stopPropagation();
  };

  render() {
    const {
      image,
      title,
      tProperty1,
      tProperty2,
      description,
      bProperty1,
      bProperty2,
      menus,
      loading,
      icon,
      onClick,
      className
    } = this.props;

    return (
      <Wrapper
        className={`${className} ${loading ? 'loading' : ''}`}
        style={{ cursor: onClick && 'pointer' }}
        onClick={onClick}
      >
        <Logo src={image} className="logo" />

        {icon && <FontAwesomeIcon icon={icon} size="lg" />}

        <CardBody>
          {menus && (
            <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
              <DropdownToggle tag="a">
                <FontAwesomeIcon icon={faEllipsisV} />
              </DropdownToggle>

              <DropdownMenu right>
                {menus.map((item, index) => (
                  <DropdownItem key={index} onClick={item.onClick}>
                    {item.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}

          <CardTitle>{title}</CardTitle>

          {(tProperty1 || tProperty2) && (
            <CardText className="properties">
              <small className="text-muted propertty1">{tProperty1}</small>
              <small className="text-muted propertty2">{tProperty2}</small>
            </CardText>
          )}

          {description && (
            <CardText>
              <Truncate lines={2} ellipsis={<span>...</span>}>
                {description}
              </Truncate>
            </CardText>
          )}
        </CardBody>

        {(bProperty1 || bProperty2) && (
          <CardFooter>
            <CardText className="properties">
              <small className="tpropertty3">{bProperty1}</small>
              <small className="tpropertty4">{bProperty2}</small>
            </CardText>
          </CardFooter>
        )}

        {loading && <div className="mask" />}
        {loading && <Loading />}
      </Wrapper>
    );
  }
}

MJPCard.propTypes = {
  image: PropTypes.string,
  title: PropTypes.string,
  // tProperty1: PropTypes.string,
  // tProperty2: PropTypes.string,
  description: PropTypes.string,
  // bProperty1: PropTypes.string,
  // bProperty2: PropTypes.string,
  menus: PropTypes.array,
  loading: PropTypes.bool,
  // icon: PropTypes.object,
  onClick: PropTypes.func
};

export default MJPCard;
