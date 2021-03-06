import React from 'react';
import { isStream, on } from 'flyd';

export default function createReactiveClass(tag) {
  class ReactiveClass extends React.Component {
    constructor(props) {
      super(props);
      this.displayName = `FlydReactiveElement-${tag}`;
      this.state = {};
    }

    componentWillMount() {
      this.subscribe(this.props);
    }

    componentWillReceiveProps(nextProps) {
      this.subscribe(nextProps);
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    addPropListener(name, prop$) {
      return on((value) => {
        // don't re-render if value is the same.
        if (value === this.state[name]) {
          return;
        }

        const prop = {};
        prop[name] = value;
        this.setState(prop);
      }, prop$);
    }

    subscribe(props) {
      if (this.subscriptions) {
        this.unsubscribe();
      }

      this.subscriptions = [];

      Object.keys(props).forEach(key => {
        const value = props[key];
        if (isStream(value)) {
          const subscription = this.addPropListener(key, value);
          this.subscriptions.push(subscription);
        }
      });
    }

    unsubscribe() {
      this.subscriptions.forEach(subscription => subscription.end());
      this.subscriptions = null;
      this.state = {};
    }

    render() {
      const finalProps = {...this.props, ...this.state};
      if (tag) {
        return React.createElement(tag, finalProps);
      }
      const {children, ...props} = finalProps;
      return React.cloneElement(children, props);
    }
  }

  return ReactiveClass;
}
