import React, {Component} from 'react'
import {sortBy} from 'lodash'
import './index.css'

import Button from '../components/Button'
import Sort from '../components/Sort'


const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
}

class Table extends Component {
  constructor(props) {
    super(props)
    this.state = {sortKey: 'NONE', isSortReverse: false}
  }

  onSort = (sortKey) => {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse
    this.setState({sortKey, isSortReverse})
  }

  render() {
    const {list, onDismiss} = this.props
    const {sortKey, isSortReverse} = this.state

    const sortedList = SORTS[sortKey](list)
    const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList

    return (
      <div className='table'>
        <div className='table-header'>
      <span className='large-column'>
        <Sort sortKey={'TITLE'} activeSortKey={sortKey} onSort={this.onSort}>Title</Sort>
      </span>
          <span className='mid-column'>
        <Sort sortKey={'AUTHOR'} activeSortKey={sortKey} onSort={this.onSort}>Author</Sort>
      </span>
          <span className='small-column'>
        <Sort sortKey={'COMMENTS'} activeSortKey={sortKey} onSort={this.onSort}>Comments</Sort>
      </span>
          <span className='small-column'>
        <Sort sortKey={'POINTS'} activeSortKey={sortKey} onSort={this.onSort}>Points</Sort>
      </span>
          <span className='small-column'>Archive</span>
        </div>

        {reverseSortedList.map(item =>
            <div className='table-row' key={item.objectID}>
        <span className='large-column'>
          <a href={item.url}>{item.title} </a>
        </span>
              <span className='mid-column'>{item.author} </span>
              <span className='small-column'>{item.num_comments} </span>
              <span className='small-column'>{item.points} </span>
              <span className='small-column'>
          <Button className='button-inline' onClick={() => onDismiss(item.objectID)}>Dismiss</Button>
        </span>
            </div>
        )}
      </div>
    )
  }
}

export default Table