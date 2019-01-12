import React from 'react'

const Item = ({ item, removeItem }) => {

  const { title, authors, img } = item;

  return (
    <div className="container">
    <h3>{title}</h3>
    <h4>{authors.join(', ')}</h4>
    <img src={img} alt={title} />
    <p>{ item.status ? item.status : null }</p>


    {removeItem ? <button onClick={() => removeItem(item)}> Remove </button> : null}
  </div>
  )
}

export default Item
