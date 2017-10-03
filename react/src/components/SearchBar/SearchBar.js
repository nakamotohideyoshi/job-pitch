import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormControl from 'react-bootstrap/lib/FormControl';
import styles from './SearchBar.scss';

export default class SearchBar extends Component {
  static propTypes = {
    placeholder: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
  }

  static defaultProps = {
    placeholder: '',
    className: '',
    onChange: () => {}
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  onChange = event => {
    const text = event.target.value;
    this.setState({ text });
    this.props.onChange(text);
  }

  onClear = () => {
    this.setState({ text: '' });
    this.props.onChange('');
  }

  render() {
    const { placeholder, className } = this.props;
    const { text } = this.state;
    return (
      <div className={[styles.container, className].join(' ')}>
        <FormControl
          type="text"
          value={text || ''}
          placeholder={placeholder}
          onChange={this.onChange}
        />
        <i className="fa fa-search"></i>
        {
          text &&
          <button
            className="fa fa-times link-btn"
            onClick={this.onClear}
          />
        }
      </div>
    );
  }
}
