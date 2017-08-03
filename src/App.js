import React, {Component} from 'react'
import Button from './components/Button'
import Search from './components/Search'
import Sort from './components/Sort'
import Table from './components/Table'
import './App.css'

import {
  DEFAULT_QUERY,
  DEFAULT_PAGE,
  DEFAULT_HPP,

  PATH_BASE,
  PATH_SEARCH,
  PARAM_SEARCH,
  PARAM_PAGE,
  PARAM_HPP,
} from "./constants"


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

const Loading = () => <div>Loading... </div>

const withLoading = (Component) => ({isLoading, ...rest}) =>
  isLoading ? <Loading /> : <Component {...rest} />

const ButtonWithLoading = withLoading(Button)

export default App;

export {Search, Table, Button, Sort}