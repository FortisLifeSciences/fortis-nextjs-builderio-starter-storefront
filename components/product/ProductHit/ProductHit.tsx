import React from 'react'

type Product = {
  objectID: string
  product_name: string
  sku: string
}

const ProductHit = ({ hit }: { hit: Product }): JSX.Element => {
  console.log('hit', hit)
  return (
    <div>
      <h3>{hit.product_name}</h3>
      <p>{'long live the king'}</p>
      <p>{hit.sku}</p>
    </div>
  )
}

export default ProductHit
