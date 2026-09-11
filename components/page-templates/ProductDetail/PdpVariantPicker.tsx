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

export default PdpVariantPicker
