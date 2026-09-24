import { useEffect, useRef, useState } from 'react'

import styles from './Pdp.module.css'

export interface PdpVariantOption {
  value: string
  label: string
  sku?: string | null
  price?: string | null
  disabled?: boolean
}

interface PdpVariantPickerProps {
  options: PdpVariantOption[]
  selected?: string | null
  showPrices?: boolean
  onChange: (value: string) => void
}

const PdpVariantPicker = ({
  options,
  selected,
  showPrices = true,
  onChange,
}: PdpVariantPickerProps) => {
  if (!options || options.length === 0) return null

  return (
    <div className={styles.optionPicker}>
      <div className={styles.optionList} role="radiogroup">
        {options.map((option) => {
          const isSelected = option.value === selected
          return (
            <button
              type="button"
              role="radio"
              aria-checked={isSelected}
              key={option.value}
              disabled={option.disabled}
              onClick={() => onChange(option.value)}
              className={`${styles.sizeOption} ${isSelected ? styles.sizeOptionSelected : ''}`}
            >
              <span className={styles.optionRadio} aria-hidden="true" />
              <span className={styles.sizeMain}>{option.label}</span>
              {option.sku ? <span className={styles.sizeSku}>{option.sku}</span> : null}
              {showPrices && option.price ? (
                <span className={styles.sizePrice}>{option.price}</span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const PdpMobileSizePicker = ({
  options,
  selected,
  showPrices = true,
  onChange,
}: PdpVariantPickerProps) => {
  const [open, setOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  if (!options || options.length === 0) return null

  const current = options.find((option) => option.value === selected) ?? options[0]

  const optionContent = (option: PdpVariantOption) => (
    <>
      <span className={styles.sizeMain}>{option.label}</span>
      <span className={styles.sizeSku}>{option.sku}</span>
      <span className={styles.sizePrice}>{showPrices ? option.price : null}</span>
    </>
  )

  return (
    <div className={styles.mobileSizePicker} ref={pickerRef}>
      <button
        type="button"
        className={`${styles.mobileSizeTrigger} ${open ? styles.mobileSizeTriggerOpen : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className={styles.mobileSizeSelected}>{optionContent(current)}</span>
        <span className={styles.mobileSizeArrow} aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <path d="M6 3.5 10.5 8 6 12.5" />
          </svg>
        </span>
      </button>
      {open ? (
        <div className={styles.mobileSizeOptions} role="listbox" aria-label="Product size">
          {options.map((option) => {
            const isSelected = option.value === current.value
            return (
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                key={option.value}
                disabled={option.disabled}
                onClick={() => {
                  setOpen(false)
                  if (!isSelected) onChange(option.value)
                }}
                className={`${styles.mobileSizeOption} ${
                  isSelected ? styles.mobileSizeOptionSelected : ''
                }`}
              >
                {optionContent(option)}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default PdpVariantPicker
