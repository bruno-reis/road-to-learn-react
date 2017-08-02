import React, {Component} from 'react'
import {sortBy} from 'lodash'
import './App.css'

const DEFAULT_QUERY = 'redux'
const DEFAULT_PAGE = 0
const DEFAULT_HPP = '50'

const PATH_BASE = 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const PARAM_SEARCH = 'query='
const PARAM_PAGE = 'page='
const PARAM_HPP = 'hitsPerPage='

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {results: null, searchKey: '', searchTerm: DEFAULT_QUERY,
      isLoading: false, isSortReverse: false, sortKey: 'NONE'}
  }

  componentDidMount() {
    const {searchTerm} = this.state
    this.setState({searchKey: searchTerm})
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE)
  }

  setSearchTopstories = (result) => {
    const {hits, page} = result
    this.setState(this.updateSearchTopstories(hits, page))
  }

  updateSearchTopstories = (hits, page) => (prevState) => {
    const {searchKey, results} = prevState
    const oldHits = results && results[searchKey] ? results[searchKey].hits : []
    const updatedHits = [...oldHits, ...hits]

    return {
      results: {
        ...results,
        [searchKey]: {hits: updatedHits, page}
      },
      isLoading: false
    }
  }

  fetchSearchTopstories = (searchTerm, page) => {
    this.setState({isLoading: true})

    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => this.setSearchTopstories(result))
  }

  needsToSearchTopstories = (searchTerm) => !this.state.results[searchTerm]

  onSearchChange = (event) => this.setState({searchTerm: event.target.value})

  onSearchSubmit = (event) => {
    const {searchTerm} = this.state
    this.setState({searchKey: searchTerm})

    if (this.needsToSearchTopstories(searchTerm)) this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE)
    event.preventDefault()
  }

  onDismiss = (id) => {
    const {searchKey, results} = this.state
    const {hits, page} = results[searchKey]
    const updatedHits = hits.filter(item => item.objectID !== id)

    this.setState({
      results: {
        ...results,
        [searchKey]: {hits: updatedHits, page}
      }
    })
  }

  render() {
    const {searchTerm, results, searchKey, isLoading} = this.state
    const page = (results && results[searchKey] && results[searchKey].page) || 0
    const list = (results && results[searchKey] && results[searchKey].hits) || []

    return (
      <div className="page">
        <div className="interactions">
          <Search value={searchTerm} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>Search</Search>
        </div>
        <Table list={list} onDismiss={this.onDismiss}/>
        <div className="interactions">
          <ButtonWithLoading isLoading={isLoading}
                             onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}>More
          </ButtonWithLoading>
        </div>
      </div>
    )
  }
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
      <div className="table">
        <div className="table-header">
      <span className="large-column">
        <Sort sortKey={'TITLE'} activeSortKey={sortKey} onSort={this.onSort}>Title</Sort>
      </span>
          <span className="mid-column">
        <Sort sortKey={'AUTHOR'} activeSortKey={sortKey} onSort={this.onSort}>Author</Sort>
      </span>
          <span className="small-column">
        <Sort sortKey={'COMMENTS'} activeSortKey={sortKey} onSort={this.onSort}>Comments</Sort>
      </span>
          <span className="small-column">
        <Sort sortKey={'POINTS'} activeSortKey={sortKey} onSort={this.onSort}>Points</Sort>
      </span>
          <span className="small-column">Archive</span>
        </div>

        {reverseSortedList.map(item =>
            <div className="table-row" key={item.objectID}>
        <span className="large-column">
          <a href={item.url}>{item.title} </a>
        </span>
              <span className="mid-column">{item.author} </span>
              <span className="small-column">{item.num_comments} </span>
              <span className="small-column">{item.points} </span>
              <span className="small-column">
          <Button className="button-inline" onClick={() => onDismiss(item.objectID)}>Dismiss</Button>
        </span>
            </div>
        )}
      </div>
    )
  }
}

const Search = ({value, onChange, onSubmit, children}) =>
  <form onSubmit={onSubmit}>
    <input type="text" value={value} onChange={onChange}/>
    <button type="submit">{children}</button>
  </form>

const Sort = ({sortKey, activeSortKey, onSort, children}) => {
  const sortClass = ['button-inline']
  if (sortKey === activeSortKey) sortClass.push('button-active')

  return (
    <Button onClick={() => onSort(sortKey)} className={sortClass.join(' ')}>{children}</Button>
  )
}

const Button = ({onClick, className = '', children}) =>
  <button className={className} onClick={onClick} type="button">{children}</button>

const Loading = () => <div>Loading... </div>

const withLoading = (Component) => ({isLoading, ...rest}) =>
  isLoading ? <Loading /> : <Component {...rest} />

const ButtonWithLoading = withLoading(Button)

export default App;

export {Search, Table, Button}