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

describe('PdpVariantPicker sale price', () => {
  const saleOptions: PdpVariantOption[] = [
    { ...options[0], price: '$93.00', originalPrice: '$100.00' },
    options[1],
  ]

  it('shows the original price struck through next to the sale price', () => {
    render(<PdpVariantPicker options={saleOptions} selected="100ug" onChange={jest.fn()} />)

    const saleOption = within(screen.getByRole('radio', { name: /100ug/ }))
    expect(saleOption.getByText('$100.00').tagName).toBe('S')
    expect(saleOption.getByText('$93.00', { exact: false })).toBeInTheDocument()
    expect(
      within(screen.getByRole('radio', { name: /500ug/ })).queryByText('$100.00')
    ).not.toBeInTheDocument()
  })

  it('shows the original price on the mobile selector', () => {
    render(<PdpMobileSizePicker options={saleOptions} selected="100ug" onChange={jest.fn()} />)

    expect(
      within(screen.getByRole('button', { expanded: false })).getByText('$100.00').tagName
    ).toBe('S')
  })
})
