import React from 'react';
import Helmet from 'react-helmet';

import RegButton from './RegButton';
import Wrapper from './Wrapper';
import GooglePlayImgUrl from 'assets/googleplay-button.svg';
import iTunesImgUrl from 'assets/itunes-button.svg';

const SPLASH_IMAGES = [
  require('assets/splash1.jpg'),
  require('assets/splash2.jpg'),
  require('assets/splash3.jpg'),
  require('assets/splash4.jpg'),
  require('assets/splash5.jpg')
];

const AppButton = ({ url, img }) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    <img src={img} alt="" className="appButtonImg" />
  </a>
);

export default class Home extends React.Component {
  state = {
    currentIndex: 0
  };

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({
        currentIndex: (this.state.currentIndex + 1) % SPLASH_IMAGES.length
      });
    }, 15000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    return (
      <Wrapper>
        <Helmet title="Home" />

        {SPLASH_IMAGES.map((image, index) => (
          <div
            key={index}
            className="splash"
            style={{
              backgroundImage: `url(${image})`,
              opacity: index === this.state.currentIndex ? 1 : 0
            }}
          />
        ))}

        <div className="content">
          <div className="title">Recruitment where first impression count</div>

          <div>
            <RegButton to="/auth/register/recruiter" recruiter="true">
              <span>{"I'm a"}</span>
              <span>Recruiter</span>
            </RegButton>
            <RegButton to="/auth/register/jobseeker">
              <span>{"I'm a"}</span>
              <span>Jobseeker</span>
            </RegButton>
          </div>

          <AppButton url="https://discussions.apple.com" img={GooglePlayImgUrl} />
          <AppButton url="https://play.google.com" img={iTunesImgUrl} />
        </div>
      </Wrapper>
    );
  }
}
