import React from 'react'

import { composeStories } from '@storybook/testing-react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import * as stories from './ImageGallery.stories'
import { imageGalleryData } from '@/__mocks__/stories/imageGalleryDataMock'

const { Gallery, Zoomed } = composeStories(stories)

// Utility Functions
const setupGallery = () => {
  const user = userEvent.setup()
  render(<Gallery {...Gallery.args} />)
  return { user }
}

const setupZoomedGallery = () => {
  const user = userEvent.setup()
  render(<Zoomed {...Zoomed.args} />)
  return { user }
}

const mockTouchElement = () => {
  Element.prototype.getBoundingClientRect = jest.fn(() => ({
    width: 300,
    height: 300,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  }))
}

const createTouchEvent = (type, { screenX, screenY }) =>
  new TouchEvent(type, {
    changedTouches: [{ screenX, screenY }],
  })

const swipeEvents = {
  leftSwipe: {
    start: { screenX: 210, screenY: 248 },
    end: { screenX: 118, screenY: 254 },
  },
  rightSwipe: {
    start: { screenX: 80, screenY: 280 },
    end: { screenX: 200, screenY: 287 },
  },
}

// Tests
describe('[component] ImageGallery component', () => {
  describe('Gallery without Zoom', () => {
    it('should not render the title', () => {
      setupGallery()
      expect(screen.queryByText(Gallery.args.title)).not.toBeInTheDocument()
    })

    it('should render all the images provided in props', () => {
      setupGallery()
      const thumbnails = screen.getAllByLabelText(/kibo-image-thumbnail/i)
      expect(thumbnails).toHaveLength(imageGalleryData.images.length)
    })

    it('should render the selected image by default', () => {
      setupGallery()
      const selectedImage = screen.getByTestId(/selected-image/i)
      expect(selectedImage).toBeVisible()
    })

    it('should show the down arrow button if thumbnail count exceeds limit', () => {
      setupGallery()
      const downArrowButton = screen.getByRole('button', { name: /down/i })
      expect(downArrowButton).toBeVisible()
    })

    it('should navigate thumbnails on down arrow click', async () => {
      const { user } = setupGallery()
      Element.prototype.scrollBy = jest.fn()

      const downArrowButton = screen.getByRole('button', { name: /down/i })
      await user.click(downArrowButton)

      const upArrowButton = await screen.findByRole('button', { name: /up/i })
      expect(upArrowButton).toBeVisible()
    })

    it('should update the selected thumbnail on click', async () => {
      const { user } = setupGallery()
      const thumbnails = screen.getAllByLabelText(/kibo-image-thumbnail/i)

      // Assert initial selection
      thumbnails.forEach((thumbnail, i) => {
        const expectedState = i === 0 ? 'true' : 'false'
        expect(thumbnail).toHaveAttribute('aria-selected', expectedState)
      })

      // Click second thumbnail
      await user.click(thumbnails[1])

      // Assert new selection
      await waitFor(() => {
        thumbnails.forEach((thumbnail, i) => {
          const expectedState = i === 1 ? 'true' : 'false'
          expect(thumbnail).toHaveAttribute('aria-selected', expectedState)
        })
      })
    })

    it('should handle swipe gestures to navigate images', () => {
      setupGallery()
      mockTouchElement()

      const gestureZone = screen.getByTestId('gestureZone')

      const performSwipe = (swipeType) => {
        const { start, end } = swipeEvents[swipeType]
        act(() => {
          gestureZone.dispatchEvent(createTouchEvent('touchstart', start))
          gestureZone.dispatchEvent(createTouchEvent('touchend', end))
        })
      }

      const getCurrentImage = () => screen.getByTestId(/selected-image/i)

      // Initial image
      let selectedImage = getCurrentImage()
      expect(selectedImage).toHaveAttribute('alt', Gallery.args.images[0].altText)

      // Perform left swipe
      performSwipe('leftSwipe')
      selectedImage = getCurrentImage()
      expect(selectedImage).toHaveAttribute('alt', Gallery.args.images[1].altText)

      // Perform right swipe
      performSwipe('rightSwipe')
      selectedImage = getCurrentImage()
      expect(selectedImage).toHaveAttribute('alt', Gallery.args.images[0].altText)
    })
  })

  describe('Zoomed Gallery', () => {
    it('should render the title', () => {
      setupZoomedGallery()
      expect(screen.getByText(Gallery.args.title)).toBeVisible()
    })

    it('should navigate thumbnails using left/right arrow buttons', async () => {
      const { user } = setupZoomedGallery()
      const thumbnails = screen.getAllByLabelText(/kibo-image-thumbnail/i)

      const nextButton = screen.getByRole('button', { name: /next/i })
      const previousButton = screen.getByRole('button', { name: /previous/i })

      await user.click(nextButton)
      await waitFor(() => {
        expect(thumbnails[1]).toHaveAttribute('aria-selected', 'true')
      })

      await user.click(previousButton)
      await waitFor(() => {
        expect(thumbnails[0]).toHaveAttribute('aria-selected', 'true')
      })
    })

    it('should render and display zoom controls', () => {
      setupZoomedGallery()
      const reset = screen.getByRole('button', { name: /reset/i })
      const zoomIn = screen.getByRole('button', { name: /zoom in/i })
      const zoomOut = screen.getByRole('button', { name: /zoom out/i })

      expect(reset).toBeVisible()
      expect(zoomIn).toBeVisible()
      expect(zoomOut).toBeVisible()
    })
  })
})
