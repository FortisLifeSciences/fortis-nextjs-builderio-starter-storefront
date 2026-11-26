const fieldErrorSelector = '.Mui-error input, .Mui-error textarea'

export const scrollToFirstFieldError = (container: HTMLElement | null, framesLeft = 10) => {
  requestAnimationFrame(() => {
    const field = container?.querySelector<HTMLElement>(fieldErrorSelector)
    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' })
      field.focus({ preventScroll: true })
      return
    }
    if (framesLeft > 0) scrollToFirstFieldError(container, framesLeft - 1)
  })
}
