import { orderGetters } from '../getters/orderGetters'

import type { CrOrder, CrOrderItem } from '../gql/types'

const CSV_HEADERS = [
  'Order Number',
  'Placed Date',
  'Status',
  'Payment Status',
  'Fulfillment Status',
  'Total',
  'Catalog Number',
  'Product',
  'Quantity',
  'Line Total',
]

const escapeCsvValue = (value: unknown): string => {
  const stringValue = value === null || value === undefined ? '' : String(value)

  return /[",\n\r]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue
}

export const buildOrdersCsv = (orders: CrOrder[]): string => {
  const rows: string[][] = [CSV_HEADERS]

  orders.forEach((order) => {
    const orderNumber = orderGetters.getOrderNumber(order)
    const submittedDate = orderGetters.getSubmittedDate(order)
    const status = orderGetters.getOrderStatus(order)
    const paymentStatus = orderGetters.getOrderPaymentStatus(order)
    const fulfillmentStatus = orderGetters.getOrderFulfillmentStatus(order)
    const total = orderGetters.getOrderTotal(order)
    const items = (order?.items ?? []) as CrOrderItem[]

    if (!items.length) {
      rows.push([
        String(orderNumber),
        String(submittedDate ?? ''),
        status,
        paymentStatus,
        fulfillmentStatus,
        String(total),
        '',
        '',
        '',
        '',
      ])
      return
    }

    items.forEach((item) => {
      rows.push([
        String(orderNumber),
        String(submittedDate ?? ''),
        status,
        paymentStatus,
        fulfillmentStatus,
        String(total),
        String(item?.product?.productCode ?? ''),
        String(item?.product?.name ?? ''),
        String(item?.quantity ?? ''),
        String(item?.total ?? ''),
      ])
    })
  })

  return rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n')
}

export const downloadCsv = (csvContent: string, fileName: string) => {
  const blob = new Blob([`﻿${csvContent}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
