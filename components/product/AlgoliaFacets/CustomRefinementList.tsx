import { Add, CheckBox, CheckBoxOutlineBlank, Remove } from '@mui/icons-material'
import { Button, Checkbox, FormControlLabel, SxProps } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { useRefinementList } from 'react-instantsearch-hooks-web'
const style = {
  stack: {
    width: '100%',
  },
  formControlLabel: {
    width: '100%',
    fontSize: (theme: Theme) => theme.typography.body2,
    '& .MuiFormControlLabel-label': {
      fontSize: '16px',
      fontWeight: '300',
      lineHeight: 'normal',
    },
  } as SxProps<Theme> | undefined,
  formLabel: {
    typography: 'body2',
    color: 'text.primary',
  },
  viewMore: {
    textTransform: 'capitalize',
    color: 'text.primary',
    pl: 0,
  },
}

function CustomRefinementList({ attribute }: { attribute: string }) {
  const { items, refine, isShowingMore, canToggleShowMore, toggleShowMore } = useRefinementList({
    attribute,
    showMore: true,
    limit: 6,
  })
  const isHtml = (str: string) => {
    if (!str) return ''
    const tempElement = document.createElement('div')
    tempElement.innerHTML = str
    return tempElement.textContent as string
  }

  return (
    <div>
      {items.map((item) => (
        <FormControlLabel
          key={item.label}
          sx={{ ...style.formControlLabel }}
          control={
            <Checkbox
              icon={<CheckBoxOutlineBlank />}
              checkedIcon={<CheckBox />}
              checked={item.isRefined}
              size="small"
              inputProps={{
                'aria-label': isHtml(item.label),
              }}
              onChange={() => refine(item.value)}
            />
          }
          //label={`${item.label} (${item.count})`}
          label={`${item.label}`}
        />
      ))}
      {canToggleShowMore && (
        <Button
          onClick={toggleShowMore}
          style={{ marginTop: '8px', fontSize: '1rem' }}
          variant="text"
          name={isShowingMore ? 'View Less' : 'View More'}
          aria-label={isShowingMore ? 'View Less' : 'View More'}
          sx={{ ...style.viewMore }}
          startIcon={isShowingMore ? <Remove fontSize="small" /> : <Add fontSize="small" />}
        >
          {isShowingMore ? 'View Less' : 'View More'}
        </Button>
      )}
    </div>
  )
}

export default CustomRefinementList
