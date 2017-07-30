import React, {Component} from 'react'
import './App.css'

const DEFAULT_QUERY = 'redux'
const DEFAULT_PAGE = 0
const DEFAULT_HPP = 50

const PATH_BASE = 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const PARAM_SEARCH = 'query='
const PARAM_PAGE = 'page='
const PARAM_HPP = 'histsPerPage='

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {result: null, searchTerm: DEFAULT_QUERY}
  }

  setSearchTopstories = (result) => {
    const {hits, page} = result
    const oldHits = page !== 0 ? this.state.result.hits : []
    const updatedHits = [...oldHits, ...hits]
    this.setState({result: {hits: updatedHits, page}})
  }

  fetchSearchTopstories = (searchTerm, page) =>
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}
    &${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => this.setSearchTopstories(result))
      .catch(e => e)

  onDismiss = (id) => {
    const updatedHits = this.state.result.hits.filter(item => item.objectID !== id)
    console.log(updatedHits)
    this.setState({result: {...this.state.result, hits: updatedHits}})
  }

  onSearchChange = (event) =>
    this.setState({ searchTerm: event.target.value})

  onSearchSubmit = (event) => {
    const {searchTerm} = this.state
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE)
    event.preventDefault()
  }

  componentDidMount() {
    const {searchTerm} = this.state
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE)
  }

  render() {
    const {searchTerm, result} = this.state
    const page = (result && result.page) || 0
    return (
      <div className="page">
        <div className="interactions">
          <Search value={searchTerm} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>Search</Search>
        </div>
        { result ? <Table list={result.hits} onDismiss={this.onDismiss}/> : null }
        <div className="interactions">
          <Button onClick={() => this.fetchSearchTopstories(searchTerm, page+1)}>More</Button>
        </div>
      </div>
    )
  }
}

const Search = ({value, onChange, onSubmit, children}) =>
  <form onSubmit={onSubmit}>
    <input type="text" value={value} onChange={onChange}/>
    <button type="submit">{children}</button>
  </form>


const Table = ({list, onDismiss}) =>
  <div className="table">
    { list.map(item =>
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


const Button = ({onclick, className = '', children}) =>
  <button className={className} onClick={onclick} type="button">{children}</button>


export default App;
