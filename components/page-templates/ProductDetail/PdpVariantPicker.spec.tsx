import { fireEvent, render, screen, within } from '@testing-library/react'

import PdpVariantPicker, { PdpMobileSizePicker } from './PdpVariantPicker'

import type { PdpVariantOption } from './PdpVariantPicker'

const options: PdpVariantOption[] = [
  { value: '100ug', label: '100ug', sku: 'A303-500A-100', price: '$100.00', isNew: true },
  { value: '500ug', label: '500ug', sku: 'A303-500A-500', price: '$400.00' },
]

describe('PdpVariantPicker new variant tag', () => {
  it('shows the tag only on the option marked as new', () => {
    render(<PdpVariantPicker options={options} selected="100ug" onChange={jest.fn()} />)

    expect(
      within(screen.getByRole('radio', { name: /100ug/ })).getByText('new')
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('radio', { name: /500ug/ })).queryByText('new')
    ).not.toBeInTheDocument()
  })

  it('shows no tag when no option is new', () => {
    render(
      <PdpVariantPicker
        options={options.map((option) => ({ ...option, isNew: false }))}
        selected="100ug"
        onChange={jest.fn()}
      />
    )

    expect(screen.queryByText('new')).not.toBeInTheDocument()
  })
})

describe('PdpMobileSizePicker new variant tag', () => {
  it('shows the tag on the closed selector when the selected option is new', () => {
    render(<PdpMobileSizePicker options={options} selected="100ug" onChange={jest.fn()} />)

    expect(
      within(screen.getByRole('button', { expanded: false })).getByText('new')
    ).toBeInTheDocument()
  })

  it('shows the tag only on the new option in the open list', () => {
    render(<PdpMobileSizePicker options={options} selected="100ug" onChange={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { expanded: false }))

    expect(
      within(screen.getByRole('option', { name: /100ug/ })).getByText('new')
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('option', { name: /500ug/ })).queryByText('new')
    ).not.toBeInTheDocument()
  })
})
