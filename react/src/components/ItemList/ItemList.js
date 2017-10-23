
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/lib/Button';
import { Loading, SearchBar } from 'components';
import styles from './ItemList.scss';

export default class ItemList extends Component {
  static propTypes = {
    items: PropTypes.array,
    onFilter: PropTypes.func,
    buttons: PropTypes.array,
    renderItem: PropTypes.func,
    renderEmpty: PropTypes.func,
    className: PropTypes.string,
  }

  static defaultProps = {
    items: null,
    onFilter: null,
    buttons: [],
    renderItem: () => {},
    renderEmpty: () => {},
    className: '',
  }

  constructor(props) {
    super(props);
    this.state = {
      items: []
    };
    this.filterText = '';
  }

  componentDidMount() {
    this.onFilter();
  }

  componentWillReceiveProps() {
    this.updated = true;
  }

  componentDidUpdate() {
    if (this.updated) {
      this.updated = false;
      this.onFilter();
    }
  }

  onFilter = text => {
    if (text !== undefined) {
      this.filterText = text;
    }

    const { items, onFilter } = this.props;
    if (items) {
      this.setState({
        items: items.filter(item => onFilter(item, this.filterText))
      });
    }
  }

  renderList = () => {
    const { renderItem, renderEmpty } = this.props;
    const { items } = this.state;

    if (items.length) {
      return (
        <div>
          { items.map(renderItem) }
        </div>
      );
    }

    return (
      <div className={styles.empty}>
        {
          this.props.items.length === 0 ?
            renderEmpty() :
            <span>No search results</span>
        }
      </div>
    );
  }

  render() {
    const { items, onFilter, buttons, className } = this.props;
    return (
      <div className={[styles.itemList, className].join(' ')}>
        {
          (onFilter || buttons.length) &&
          <div className={styles.header}>
            {
              onFilter &&
              <SearchBar
                className={styles.searchbar}
                placeholder="Search"
                onChange={this.onFilter}
              />
            }
            {
              buttons.map(button => (
                <Button
                  key={button.label}
                  bsStyle={button.bsStyle}
                  onClick={button.onClick}
                >{button.label}</Button>
              ))
            }
          </div>
        }
        {
          !items ?
            <div className={styles.loading}><Loading /></div> :
            this.renderList()
        }
      </div>
    );
  }
}
