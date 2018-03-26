import React from 'react';
import PropTypes from 'prop-types';
import { Input, Row, Col, message, Card, Icon, Avatar } from 'antd';
import Truncate from 'react-truncate';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEllipsisV from '@fortawesome/fontawesome-free-solid/faEllipsisV';

import Logo from '../tags/Logo';
import Loading from '../tags/Loading';
import Wrapper from './Wrapper';

const { Meta } = Card;

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
        cover={<Logo src={image} className="logo" />}
        actions={[<Icon type="setting" />, <Icon type="edit" />, <Icon type="ellipsis" />]}
      >
        <Meta title={title} description="This is the description" />
        <p>dddd</p>
      </Wrapper>
      // <Wrapper
      //   className={`${className} ${loading ? 'loading' : ''}`}
      //   style={{ cursor: onClick && 'pointer' }}
      //   onClick={onClick}
      // >
      //   {icon && <FontAwesomeIcon icon={icon} size="lg" />}

      //   <CardBody>
      //     {menus && (
      //       <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
      //         <DropdownToggle tag="a">
      //           <FontAwesomeIcon icon={faEllipsisV} />
      //         </DropdownToggle>

      //         <DropdownMenu right>
      //           {menus.map((item, index) => (
      //             <DropdownItem key={index} onClick={item.onClick}>
      //               {item.label}
      //             </DropdownItem>
      //           ))}
      //         </DropdownMenu>
      //       </Dropdown>
      //     )}

      //     <CardTitle>{title}</CardTitle>

      //     {(tProperty1 || tProperty2) && (
      //       <CardText className="properties">
      //         <small className="text-muted propertty1">{tProperty1}</small>
      //         <small className="text-muted propertty2">{tProperty2}</small>
      //       </CardText>
      //     )}

      //     {description && (
      //       <CardText>
      //         <Truncate lines={2} ellipsis={<span>...</span>}>
      //           {description}
      //         </Truncate>
      //       </CardText>
      //     )}
      //   </CardBody>

      //   {(bProperty1 || bProperty2) && (
      //     <CardFooter>
      //       <CardText className="properties">
      //         <small className="tpropertty3">{bProperty1}</small>
      //         <small className="tpropertty4">{bProperty2}</small>
      //       </CardText>
      //     </CardFooter>
      //   )}

      //   {loading && <div className="mask" />}
      //   {loading && <Loading />}
      // </Wrapper>
    );
  }
}
export default MJPCard;
