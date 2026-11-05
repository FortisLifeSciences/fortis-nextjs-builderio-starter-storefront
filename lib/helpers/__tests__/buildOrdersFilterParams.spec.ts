import { buildOrdersFilterParams } from '../buildOrdersFilterParams'

describe('[helpers] buildOrdersFilterParams function', () => {
  it('should return order filter by order number and billing email', () => {
    const variables = {
      startIndex: 0,
      pageSize: 20,
    }

    const orderHistoryVariables = {
      ...variables,
      filters: [],
    }
    const orderStatusVariables = {
      ...variables,
      orderNumber: '81',
      billingEmail: 'chandra@email.com',
    }

    const buildOrdersFilterInputMock = {
      startIndex: 0,
      pageSize: 20,
      filter: 'orderNumber eq 81 and email eq chandra@email.com and status ne Abandoned',
    }
    const buildOrdersHistoryMock = {
      startIndex: 0,
      pageSize: 20,
      filter: 'status ne Abandoned',
    }
    expect(buildOrdersFilterParams(orderStatusVariables)).toStrictEqual(buildOrdersFilterInputMock)
    expect(buildOrdersFilterParams(orderHistoryVariables)).toStrictEqual(buildOrdersHistoryMock)
  })

  it('should match order number or partial catalog number when the search term is numeric, ignoring a leading #', () => {
    expect(
      buildOrdersFilterParams({ startIndex: 0, pageSize: 20, searchTerm: ' #4236 ' })
    ).toStrictEqual({
      startIndex: 0,
      pageSize: 20,
      filter: "(orderNumber eq 4236 or items.productCode cont '4236') and status ne Abandoned",
    })
  })

  it('should match partial catalog number when the search term is not numeric', () => {
    expect(
      buildOrdersFilterParams({ startIndex: 0, pageSize: 20, searchTerm: 'a90-116' })
    ).toStrictEqual({
      startIndex: 0,
      pageSize: 20,
      filter: "items.productCode cont 'a90-116' and status ne Abandoned",
    })
  })

  it('should strip characters that would break the filter', () => {
    expect(
      buildOrdersFilterParams({ startIndex: 0, pageSize: 20, searchTerm: "A90')(116" })
    ).toStrictEqual({
      startIndex: 0,
      pageSize: 20,
      filter: "items.productCode cont 'A90116' and status ne Abandoned",
    })
  })

  it('should ignore a search term with no usable characters', () => {
    expect(
      buildOrdersFilterParams({ startIndex: 0, pageSize: 20, searchTerm: ' #() ' })
    ).toStrictEqual({
      startIndex: 0,
      pageSize: 20,
      filter: 'status ne Abandoned',
    })
  })
})
