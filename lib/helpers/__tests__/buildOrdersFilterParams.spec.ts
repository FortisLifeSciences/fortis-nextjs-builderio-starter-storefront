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

  it('should filter by order number when the search term is numeric, ignoring a leading #', () => {
    expect(
      buildOrdersFilterParams({ startIndex: 0, pageSize: 20, searchTerm: ' #4236 ' })
    ).toStrictEqual({
      startIndex: 0,
      pageSize: 20,
      filter: 'orderNumber eq 4236 and status ne Abandoned',
    })
  })

  it('should use keyword search when the search term is not numeric', () => {
    expect(
      buildOrdersFilterParams({ startIndex: 0, pageSize: 20, searchTerm: 'PO-12345' })
    ).toStrictEqual({
      startIndex: 0,
      pageSize: 20,
      filter: 'status ne Abandoned',
      q: 'PO-12345',
    })
  })
})
