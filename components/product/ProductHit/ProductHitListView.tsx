import React from 'react'

import ProductHitGridView from './ProductHitGridView'

type ProductHitListViewProps = React.ComponentProps<typeof ProductHitGridView>

const ProductHitListView = (props: ProductHitListViewProps): JSX.Element => (
  <ProductHitGridView {...props} />
)

export default ProductHitListView
