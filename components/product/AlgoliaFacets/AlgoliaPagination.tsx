// components/product/AlgoliaFacets/AlgoliaPagination.tsx
import React from 'react'

import { Button, Box } from '@mui/material'

interface AlgoliaPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const AlgoliaPagination: React.FC<AlgoliaPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const visiblePages = 7
  let start = Math.max(currentPage - Math.floor(visiblePages / 2), 0)
  let end = start + visiblePages - 1

  if (end >= totalPages) {
    end = totalPages - 1
    start = Math.max(end - visiblePages + 1, 0)
  }

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <div className="AlgoliaPagination">
      <ul className="ais-Pagination-list">
        {/* First Page Button */}
        <li
          className={`ais-Pagination-item ais-Pagination-item--firstPage ${
            currentPage === 0 ? 'ais-Pagination-item--disabled' : ''
          }`}
        >
          <button
            className="ais-Pagination-link"
            aria-label="First"
            onClick={() => onPageChange(0)}
            disabled={currentPage === 0}
          >
            ‹‹
          </button>
        </li>

        {/* Previous Page Button */}
        <li
          className={`ais-Pagination-item ais-Pagination-item--previousPage ${
            currentPage === 0 ? 'ais-Pagination-item--disabled' : ''
          }`}
        >
          <button
            className="ais-Pagination-link"
            aria-label="Previous"
            onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
            disabled={currentPage === 0}
          >
            ‹
          </button>
        </li>

        {/* Page Numbers */}
        {pages.map((i) => (
          <li
            key={i}
            className={`ais-Pagination-item ais-Pagination-item--page ${
              i === currentPage ? 'ais-Pagination-item--selected' : ''
            }`}
          >
            <button
              className="ais-Pagination-link"
              aria-label={`Page ${i + 1}`}
              onClick={() => onPageChange(i)}
            >
              {i + 1}
            </button>
          </li>
        ))}

        {/* Next Page Button */}
        <li
          className={`ais-Pagination-item ais-Pagination-item--nextPage ${
            currentPage + 1 >= totalPages ? 'ais-Pagination-item--disabled' : ''
          }`}
        >
          <button
            className="ais-Pagination-link"
            aria-label="Next"
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages - 1))}
            disabled={currentPage + 1 >= totalPages}
          >
            ›
          </button>
        </li>

        {/* Last Page Button */}
        <li
          className={`ais-Pagination-item ais-Pagination-item--lastPage ${
            currentPage + 1 >= totalPages ? 'ais-Pagination-item--disabled' : ''
          }`}
        >
          <button
            className="ais-Pagination-link"
            aria-label="Last"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={currentPage + 1 >= totalPages}
          >
            ››
          </button>
        </li>
      </ul>
    </div>
  )
}

export default AlgoliaPagination
