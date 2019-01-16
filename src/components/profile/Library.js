import React, { Component } from 'react'
import Item from './Item'
import Results from './Results'
import axios from 'axios'

class Library extends Component {

  state = {
    title: '',
    results: []
  }

  addBook = (book) => {
    this.props.addBook(book);
    this.setState({
      title: '',
      results: []
    });
  }

  onChange = (e) => {

    const title = e.target.value;

    this.setState({
      [e.target.id]: e.target.value
    });
    if (title){

      const KEY= 'AIzaSyCJefqG9zaTxQ-yg-ubB685XySM7ZOl8kc';
      const URL = `https://www.googleapis.com/books/v1/volumes?q=${title}&filter=ebooks&key=${KEY}`;

      axios.get(URL)
      .then(response => {

        this.setState({
          results: response.data.items.slice(0, 5)
        })
      })
    } else {
      this.setState({
        results: []
      });
    }
  }

  render () {

    const { books, removeBook, returnBook } = this.props;

    const bookList = books && books.map((book, i) => {
      return (<Item key={i} item={book}
              removeItem={removeBook}
              returnBook={() => returnBook(book)} />)
    });

    return (
      <section className="library">
        <h2>Library</h2>


          <form>
          <input type="search" autoComplete="off" className="form-control" id="title"
            onChange={this.onChange} value={this.state.title} placeholder="Add Book Title..."/>
          </form>

          <Results results={this.state.results} addBook={(book) => this.addBook(book)} />

        <section className="book-list">
          { bookList }
        </section>
      </section>
    )
  }
}

export default Library
