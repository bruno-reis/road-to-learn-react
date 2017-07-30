import React, {Component} from 'react'
import './App.css'

const DEFAULT_QUERY = 'redux'

const PATH_BASE = 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const PARAM_SEARCH = 'query='

const isSearched = (searchTerm) => (item) =>
  !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase())

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {result: null, searchTerm: DEFAULT_QUERY}

    this.onDismiss = this.onDismiss.bind(this)
    this.onSearchChange = this.onSearchChange.bind(this)
  }

  setSearchTopstories = (result) =>
    this.setState({result})

  fetchSearchTopstories = (searchTerm) =>
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
      .then(response => response.json())
      .then(result => this.setSearchTopstories(result))
      .catch(e => e)

  onDismiss(id) {
    const updatedList = this.state.list.filter(el => el.objectID !== id)
    this.setState({list: updatedList})
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value})
  }

  componentDidMount() {
    const {searchTerm} = this.state
    this.fetchSearchTopstories(searchTerm)
  }

  render() {
    const {searchTerm, result} = this.state
    if (!result) return null

    return (
      <div className="page">
        <div className="interactions">
          <Search value={searchTerm} onChange={this.onSearchChange}>Search</Search>
        </div>
        <Table list={result.hits} pattern={searchTerm} onDismiss={this.onDismiss} />
      </div>
    )
  }
}

const Search = ({value, onChange, children}) =>
  <form>
    {children} <input type="text" value={value} onChange={onChange}/>
  </form>


const Table = ({list, pattern, onDismiss}) =>
  <div className="table">
    { list.filter(isSearched(pattern)).map(item =>
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
