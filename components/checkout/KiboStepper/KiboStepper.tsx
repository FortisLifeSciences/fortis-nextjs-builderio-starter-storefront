import React, { ReactNode, Children } from 'react'

import { Box, Stack, Step, Stepper, Typography, StepButton } from '@mui/material'

import { useCheckoutStepContext } from '@/context'

interface StepperProps {
  children: ReactNode
  isSticky: boolean
}

const stepperStyles = {
  wrapperBox: {
    position: 'sticky',
    width: '100%',
    zIndex: 999,
    backgroundColor: 'common.white',
    top: '50px',
    paddingTop: '20px',
  },
}

const KiboStepper = (props: StepperProps) => {
  const { children, isSticky = true } = props

  const { activeStep, steps, setActiveStep } = useCheckoutStepContext()

  const totalSteps = () => steps.length

  const handleBack = (index: number) => {
    if (activeStep > index) setActiveStep(index)
  }

  return (
    <Stack sx={{ maxWidth: '872px' }} gap={3}>
      <Box sx={isSticky ? stepperStyles.wrapperBox : {}}>
        <Stepper nonLinear activeStep={activeStep} connector={null} data-testid="kibo-stepper">
          {steps.map((label: string, index: number) => {
            const isActive = index === activeStep
            const isCompleted = index < activeStep
            return (
              <Step
                key={label}
                sx={{
                  flex: 1,
                  padding: 0,
                  backgroundColor: isActive
                    ? 'secondary.main' // Active step background
                    : isCompleted
                    ? 'primary.main' // Completed step background
                    : 'grey.300', // Default background
                  color: isActive || isCompleted ? 'common.white' : 'inherit',
                  transition: 'background-color 0.3s ease',
                }}
              >
                <StepButton icon={<></>}>
                  <Typography
                    variant="h6"
                    color={isCompleted ? 'common.white' : 'text.primary'}
                    sx={{
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                    }}
                    onClick={() => handleBack(index)}
                  >
                    {index + 1}. {label}
                  </Typography>
                </StepButton>
              </Step>
            )
          })}
        </Stepper>
      </Box>
      {Children.toArray(children)[activeStep]}
    </Stack>
  )
}

export default KiboStepper
