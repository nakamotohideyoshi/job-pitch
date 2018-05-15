import React from 'react';
import { Carousel } from 'antd';
import { LinkButton, Icons } from 'components';

import Wrapper from './Wrapper';

class Intro extends React.Component {
  state = { index: 0 };

  onChange = index => this.setState({ index });

  prevArrow = props => <Icons.AngleLeft className={props.className} onClick={props.onClick} />;

  nextArrow = props => <Icons.AngleRight className={props.className} onClick={props.onClick} />;

  render() {
    const { index } = this.state;
    const settings = {
      infinite: false,
      draggable: true,
      arrows: true,
      nextArrow: index !== 3 ? <this.nextArrow /> : null,
      prevArrow: index !== 0 ? <this.prevArrow /> : null
    };

    return (
      <Wrapper visible footer={null} maskClosable={false} onCancel={this.props.onClose} zIndex={2000}>
        <Carousel afterChange={this.onChange} {...settings}>
          {this.props.data.map((data, i) => (
            <div key={i} className="content">
              <h3>{data.title}</h3>
              <div>
                <img src={data.image} alt="" />
              </div>
              <label>{data.comment}</label>
            </div>
          ))}
        </Carousel>
        <div className="skip-container">
          <LinkButton onClick={this.props.onClose}>
            {index !== this.props.data.length - 1 ? 'Skip' : "I'm ready"}
          </LinkButton>
        </div>
      </Wrapper>
    );
  }
}

export default Intro;
