import React, { Component } from 'react';

export function withApp(WrappedComponent) {
  class WithAppComponent extends Component {
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  return WithAppComponent;
}
