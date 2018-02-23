import React from 'react';
import { Modal, Carousel } from 'antd';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faAngleLeft from '@fortawesome/fontawesome-free-solid/faAngleLeft';
import faAngleRight from '@fortawesome/fontawesome-free-solid/faAngleRight';
import { LinkButton } from 'components'

import imgLogo from 'assets/logo1.png';
import imgIntro1 from 'assets/intro1.png';
import imgIntro2 from 'assets/intro2.png';
import imgIntro3 from 'assets/intro3.png';
import Wrapper from './Wrapper';

const INTRO_DATA = [
  {
    title: 'Welcome!',
    image: imgLogo,
    comment: `You're just a few steps away from you next job!`
  },
  {
    title: 'Complete your profile',
    image: imgIntro1,
    comment: `It only takes a few seconds but will save you countless hours of searching!`
  },
  {
    title: 'Record Your Pitch',
    image: imgIntro2,
    comment: `Quick and easy! Use your phone camera to record a quick video introduction for yourself.`
  },
  {
    title: 'Get hired',
    image: imgIntro3,
    comment: `You will be able to apply and recruiters will be able to search and see your profile the moment its complete, what are you waiting for!`
  }
];

class Intro extends React.Component {
  state = { index: 0 };

  onChange = index => this.setState({ index });

  nextArrow = props => <FontAwesomeIcon icon={faAngleRight} onClick={props.onClick} className={props.className} />;

  prevArrow = props => <FontAwesomeIcon icon={faAngleLeft} onClick={props.onClick} className={props.className} />;

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
      <Wrapper
        visible
        footer={null}
        maskClosable={false}
        onCancel={this.props.onClose}
        zIndex={2000}
      >
        <Carousel afterChange={this.onChange} {...settings}>
          {INTRO_DATA.map((data, i) => (
            <div key={i}>
              <div>
                <h3>{data.title}</h3>
                <div>
                  <img src={data.image} alt="" />
                </div>
                <label>{data.comment}</label>
              </div>
            </div>
          ))}
        </Carousel>
        <div className="skip-container">
          <LinkButton onClick={this.props.onClose}>Skip</LinkButton>
        </div>
      </Wrapper>
    );
  }
}

export default Intro;
