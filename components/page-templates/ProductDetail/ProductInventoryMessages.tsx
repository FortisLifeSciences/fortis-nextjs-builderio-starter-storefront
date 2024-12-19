import React from 'react'

import { Box, styled, Typography } from '@mui/material'
import * as cookieNext from 'cookies-next'
import moment from 'moment'
import getConfig from 'next/config'

import inventoryMessages from '@/public/inventory-messages.json'

import { Product } from '@/lib/gql/types'

interface Property {
  attributeFQN: string
  values: { stringValue: string }[]
}

interface InventoryResponse {
  inventoryMessage: string | null
  cartDisplayStatus: boolean
  scenario: number | null
}

interface InventoryMessages {
  normalAvailability: string
  limitedInventoryNoBackorder: string
  onBackorderRestockUnknown: string
  onBackorderRestockDateAvailable: string
  onBackorderRestockAnticipated: string
  leadTimeRequired: string
  noInventoryNoBackorder: string
  discontinuedProduct: string
  productDiscontinuedMessage: string
  newProductNotYetForSale: string
}

const StyledBox = styled(Box)({
  display: 'flex',
  alignItems: 'start', // Vertically center the items
})

const { publicRuntimeConfig } = getConfig()
const inventorySettings = publicRuntimeConfig?.inventorySettings
const countryCode = cookieNext.getCookie('ipBasedCountryCode')
const selectCountryCode = countryCode && countryCode === 'US' ? 'United States' : ''
const inventoryMessagesObj: InventoryMessages = inventoryMessages as InventoryMessages

// Helper function to find a property by its attributeFQN
const findProperty = (product: any, attributeFQN: string) => {
  return product?.properties?.find((data: Property) => data.attributeFQN === attributeFQN)
}

const ProductInventoryMessages = ({
  product,
  currentlocationInventory,
  stockAvailable,
  availabilityMessageArr,
}: any) => {
  //   let manageStock = product?.inventoryInfo?.manageStock,
  //     //itemCode = product.get('variationProductCode') || product.get('productCode'),
  //     locationCode = 'BETHYL'
  let inventoryMessage: string | null = null
  let cartDisplayStatus = false
  let scenario: number | null = null
  let skuStatus: string | null = null
  let stockBehaviour: string | null = null
  const availabilityMessage: string | null = availabilityMessageArr ? availabilityMessageArr : null
  let minimumStock = 0
  let restockDate: Date | null = null
  let showToday = false
  // Use the helper function to extract the necessary properties
  const skuStatusArr = findProperty(product, 'tenant~sku-status-text')
  const stockBehaviourArr = findProperty(product, 'tenant~stock-behavior-option')
  const restockDateArr = findProperty(product, 'tenant~restock-date')
  const minimumStockArr = findProperty(product, 'tenant~minimum-stock')
  // Extract value for skuStatus if skuStatusArr exists
  skuStatus = skuStatusArr?.values?.[0]?.value || null

  const getInventoryMessageText = (
    product: Product,
    stockAvailable: number
  ): InventoryResponse | null => {
    if (skuStatusArr && skuStatus?.toLowerCase() === 'phaseout' && stockAvailable <= 0) {
      skuStatus = 'discontinued'
    }

    if (skuStatusArr && skuStatus?.toLowerCase() === 'onhold') {
      inventoryMessage = inventorySettings?.newProductNotYetForSale // Use Hypr.getThemeSetting here
      cartDisplayStatus = false
      scenario = 8
      return { inventoryMessage, cartDisplayStatus, scenario }
    } else if (skuStatusArr && skuStatus?.toLowerCase() === 'discontinued') {
      inventoryMessage = inventorySettings?.discontinuedProduct // Use Hypr.getThemeSetting here
      cartDisplayStatus = false
      scenario = 7
      return { inventoryMessage, cartDisplayStatus, scenario }
    } else {
      if (stockBehaviourArr) {
        stockBehaviour = stockBehaviourArr?.values?.[0]?.value
      }
      if (minimumStockArr) {
        minimumStock = minimumStockArr?.values?.[0]?.value
      }
      if (restockDateArr) {
        restockDate = null
      }
      // Handle restock date logic
      const today = new Date()
      const restockDt = restockDate ? new Date(restockDate) : null

      // Initialize the difference variable
      let Difference: number | null = null

      // Check if restockDt is valid and calculate difference if it's in the future
      if (restockDt) {
        if (restockDt < today) {
          restockDate = null // Set restockDate to null if restockDt is in the past
        } else {
          Difference = restockDt.getTime() - today.getTime() // Calculate the difference in milliseconds
        }
      }
      //console.log("Difference:"+Difference+"restockDate:"+restockDate+"today:"+today);
      if (Difference && Difference < 0 && restockDt?.toDateString() != today?.toDateString()) {
        restockDate = null
      }

      let USShippingCutOffTime, CAShippingCutOffTime, nonShippingDates, deliveryDate
      const buffer = 0

      console.log(
        'stockBehaviour:' +
          stockBehaviour +
          '==' +
          'availabilityMessage:' +
          availabilityMessage +
          '==' +
          'stockAvailable:' +
          stockAvailable +
          '==' +
          'minimumStock:' +
          minimumStock +
          '==restockDate:' +
          restockDate +
          '==skuStatus:' +
          skuStatus +
          '==buffer:' +
          buffer
      )
      if (skuStatusArr && skuStatus?.toLowerCase() === 'customcta') {
        inventoryMessage = availabilityMessage
        cartDisplayStatus = false
        scenario = 1009
        return { inventoryMessage, cartDisplayStatus, scenario }
      }
      if (skuStatusArr && skuStatus?.toLowerCase() === 'active') {
        //for scenarion 3 on Backorder Restock Unknown
        if (
          stockBehaviour?.toLowerCase() === 'acceptbackorder' &&
          availabilityMessage !== null &&
          stockAvailable < minimumStock &&
          restockDate === null
        ) {
          inventoryMessage = availabilityMessage
          cartDisplayStatus = true
          scenario = 1005
          return { inventoryMessage, cartDisplayStatus, scenario }
        }
        //for scenarion 6 no Inventory No Backorder
        if (
          stockBehaviour?.toLowerCase() === 'denybackorder' &&
          availabilityMessage !== null &&
          stockAvailable < minimumStock &&
          restockDate === null
        ) {
          inventoryMessage = availabilityMessage
          cartDisplayStatus = false
          scenario = 6
          return { inventoryMessage, cartDisplayStatus, scenario }
        }
        //for scenario 5 Lead Time Required
        if (
          stockBehaviour?.toLowerCase() === 'madetoorder' &&
          availabilityMessage !== null &&
          restockDate === null
        ) {
          inventoryMessage = availabilityMessage
          cartDisplayStatus = true
          scenario = 5
          return { inventoryMessage, cartDisplayStatus, scenario }
        }
        //for scenario 4b=43 on Backorder Restock Anticipated
        // if (
        //   stockBehaviour?.toLowerCase() === 'denybackorder' &&
        //   availabilityMessage !== null &&
        //   stockAvailable <= minimumStock &&
        //   restockDate === null
        // ) {
        //   inventoryMessage = inventoryMessagesObj?.onBackorderRestockAnticipated.replace(
        //     '{StockLeadTime}',
        //     availabilityMessage
        //   )
        //   cartDisplayStatus = false
        //   scenario = 43
        //   return { inventoryMessage, cartDisplayStatus, scenario }
        // }
        //for scenarion 4a=42 on Backorder RestockDate Available
        // if (
        //   stockBehaviour?.toLowerCase() === 'acceptbackorder' &&
        //   availabilityMessage !== null &&
        //   stockAvailable < minimumStock &&
        //   restockDate !== null
        // ) {
        //   //console.log("selectCountryCode inside inventory:"+selectCountryCode);
        //   USShippingCutOffTime = inventorySettings?.USShippingCutOffTime
        //   CAShippingCutOffTime = inventorySettings?.CAShippingCutOffTime
        //   if (selectCountryCode === 'United States') {
        //     nonShippingDates = inventorySettings?.nonShippingDates
        //   } /*else if(selectCountryCode==='Canada'){
        //                 nonShippingDates = Hypr.getThemeSetting("nonShippingDatesCanada");
        //             }*/

        //   const restockDateAfterBuffer = new Date(restockDate)
        //   //restockDateAfterBuffer.setDate(restockDateAfterBuffer.getDate() + buffer);
        //   deliveryDate = getDeliveryDate(
        //     selectCountryCode,
        //     USShippingCutOffTime,
        //     CAShippingCutOffTime,
        //     nonShippingDates,
        //     restockDateAfterBuffer,
        //     buffer
        //   )
        //   //console.log("buffer=="+buffer+"restockDate=="+restockDate+"deliveryDate=="+deliveryDate);
        //   inventoryMessage = inventoryMessagesObj?.onBackorderRestockDateAvailable.replace(
        //     '{DeliveryDate}',
        //     deliveryDate
        //   )
        //   cartDisplayStatus = true
        //   scenario = 42
        //   availabilityMessage = ''
        //   return { inventoryMessage, cartDisplayStatus, scenario }
        // }
        //for scenarion 1 normal availability
        if (
          (stockBehaviour?.toLowerCase() === 'acceptbackorder' ||
            stockBehaviour?.toLowerCase() === 'denybackorder') &&
          stockAvailable >= minimumStock &&
          restockDate === null
        ) {
          //selectCountryCode = product.get('selectedCountry');
          //console.log("selectCountryCode inside inventory:"+selectCountryCode);
          USShippingCutOffTime = inventorySettings?.USShippingCutOffTime
          CAShippingCutOffTime = inventorySettings?.CAShippingCutOffTime
          if (selectCountryCode === 'United States') {
            nonShippingDates = inventorySettings?.nonShippingDates
          } /*else if(selectCountryCode==='Canada'){
                        nonShippingDates = Hypr.getThemeSetting("nonShippingDatesCanada");
                    }*/
          //for count down time
          const countDown = getCountdown(
            selectCountryCode,
            USShippingCutOffTime,
            CAShippingCutOffTime
          )
          //console.log("countdown:"+countDown);
          //for delivery date
          deliveryDate = getDeliveryDate(
            selectCountryCode,
            USShippingCutOffTime,
            CAShippingCutOffTime,
            nonShippingDates,
            null,
            buffer
          )
          //console.log("deliverydate:"+deliveryDate);
          inventoryMessage = inventoryMessages?.normalAvailability
            .replace('{CountDown}', countDown)
            .replace('{DeliveryDate}', deliveryDate)
          cartDisplayStatus = true
          scenario = 1
          return { inventoryMessage, cartDisplayStatus, scenario }
        }
      }
      return null
    }
  }

  const getDeliveryDate = (
    CountryCode: string,
    USShippingCutOffTime: string,
    CAShippingCutOffTime: string,
    nonShippingDates: string,
    restockDateAfterBuffer: any,
    buffer: number
  ) => {
    const timeNow: any = new Date()
    let shippingTime = '',
      usWeekDays: any

    // Format the current date (month and day) with leading zeroes if needed
    const month = String(timeNow.getMonth() + 1).padStart(2, '0')
    const dday = String(timeNow.getDate()).padStart(2, '0')

    // Set shippingTime and week days based on the CountryCode
    if (CountryCode === 'United States') {
      shippingTime = `${timeNow.getFullYear()}-${month}-${dday}T${USShippingCutOffTime}`
      usWeekDays = [
        inventorySettings?.USSunday,
        inventorySettings?.USMonday,
        inventorySettings?.USTuesday,
        inventorySettings?.USWednesday,
        inventorySettings?.USThursday,
        inventorySettings?.USFriday,
        inventorySettings?.USSaturday,
      ]
    }
    // Canada logic is commented out
    /* else if (CountryCode === 'Canada') {
            shippingTime = `${timeNow.getFullYear()}-${month}-${dday}T${CAShippingCutOffTime}`;
            usWeekDays = [
                inventorySettings?.CASunday,
                inventorySettings?.CAMonday,
                inventorySettings?.CATuesday, 
                inventorySettings?.CAWednesday, 
                inventorySettings?.CAThursday, 
                inventorySettings?.CAFriday, 
                inventorySettings?.CASaturday
            ];
        } */

    // Default business week days
    const businessWeekDays: any = [false, true, true, true, true, true, false]

    // Initialize cutoff time
    const cutoffTime = new Date(shippingTime)
    // console.log('cutoffTime',cutoffTime)
    // console.log('timeNow',timeNow)
    // Function to calculate shipping day
    const shippingday: any = getShippingDate(
      usWeekDays,
      nonShippingDates,
      restockDateAfterBuffer,
      cutoffTime,
      timeNow
    )

    // Calculate next working day
    let nextworkingday = moment(shippingday).add(1, 'days')

    // Function to find the next working day
    const findNextWorkingDay = (startingDay: moment.Moment) => {
      let tempWorkingDay = startingDay
      let nextDayStatus = getWeekDayStatus(businessWeekDays, tempWorkingDay.toDate())

      while (!nextDayStatus) {
        tempWorkingDay = tempWorkingDay.add(1, 'days')
        nextDayStatus = getWeekDayStatus(businessWeekDays, tempWorkingDay.toDate())
      }

      return tempWorkingDay
    }

    if (buffer === 0) {
      nextworkingday = findNextWorkingDay(nextworkingday)
      return showToday ? 'today' : moment(nextworkingday).format('dddd, MMMM D')
    } else {
      let j = 0
      while (j < buffer) {
        // Check and adjust the working day considering buffer
        nextworkingday = findNextWorkingDay(nextworkingday)
        j++
      }
      return moment(nextworkingday).format('MMM D, YYYY')
    }
  }

  const getShippingDate = (
    usWeekDays: string,
    nonShippingDates: string,
    restockDateAfterBuffer: string,
    cutoffTime: any,
    timeNow: number
  ) => {
    const timeDifference = cutoffTime - timeNow
    let shippingdate: string | Date = '',
      nextworkingday,
      nextDayStatus,
      nextDayHolidayStatus,
      i

    if (restockDateAfterBuffer === null) {
      if (timeDifference > 0) {
        nextworkingday = moment()
        nextDayStatus = getWeekDayStatus(usWeekDays, nextworkingday.toDate())
        nextDayHolidayStatus = getWeekDayHolidayStatus(nonShippingDates, nextworkingday.toDate())
        //console.log('shipping nextworkingday:'+nextworkingday.toDate()+'=nextDayStatus:'+nextDayStatus+'=nextDayHolidayStatus:'+nextDayHolidayStatus);
        if (nextDayStatus && !nextDayHolidayStatus) {
          shippingdate = moment(nextworkingday).toDate()
          showToday = true
        } else {
          showToday = false
          for (i = 1; true; i++) {
            nextworkingday = moment(nextworkingday).add(1, 'days')
            nextDayStatus = getWeekDayStatus(usWeekDays, nextworkingday.toDate())
            nextDayHolidayStatus = getWeekDayHolidayStatus(
              nonShippingDates,
              nextworkingday.toDate()
            )
            //console.log('inside shipping nextworkingday:'+nextworkingday.toDate()+'=nextDayStatus:'+nextDayStatus+'=nextDayHolidayStatus:'+nextDayHolidayStatus);
            if (nextDayStatus && !nextDayHolidayStatus) {
              shippingdate = moment(nextworkingday).toDate()
              break
            }
          }
        }
      } else {
        cutoffTime.setDate(cutoffTime.getDate() + 1)
        //console.log("cutoffTime:"+cutoffTime);
        nextworkingday = moment(cutoffTime)
        nextDayStatus = getWeekDayStatus(usWeekDays, nextworkingday.toDate())
        nextDayHolidayStatus = getWeekDayHolidayStatus(nonShippingDates, nextworkingday.toDate())
        //console.log('shipping nextworkingday:'+nextworkingday.toDate()+'=nextDayStatus:'+nextDayStatus+'=nextDayHolidayStatus:'+nextDayHolidayStatus);
        if (nextDayStatus && !nextDayHolidayStatus) {
          shippingdate = moment(nextworkingday).toDate()
          showToday = true
        } else {
          showToday = false
          for (i = 1; true; i++) {
            nextworkingday = moment(nextworkingday).add(1, 'days')
            nextDayStatus = getWeekDayStatus(usWeekDays, nextworkingday.toDate())
            nextDayHolidayStatus = getWeekDayHolidayStatus(
              nonShippingDates,
              nextworkingday.toDate()
            )
            //console.log('inside shipping nextworkingday:'+nextworkingday.toDate()+'=nextDayStatus:'+nextDayStatus+'=nextDayHolidayStatus:'+nextDayHolidayStatus);
            if (nextDayStatus && !nextDayHolidayStatus) {
              shippingdate = moment(nextworkingday).toDate()
              break
            }
          }
        }
      }
    } else {
      //console.log("restockDateAfterBuffer"+restockDateAfterBuffer);
      nextworkingday = moment(restockDateAfterBuffer)
      nextDayStatus = getWeekDayStatus(usWeekDays, nextworkingday.toDate())
      nextDayHolidayStatus = getWeekDayHolidayStatus(nonShippingDates, nextworkingday.toDate())
      if (nextDayStatus && !nextDayHolidayStatus) {
        shippingdate = moment(nextworkingday).toDate()
      } else {
        for (i = 1; true; i++) {
          nextworkingday = moment(nextworkingday).add(1, 'days')
          nextDayStatus = getWeekDayStatus(usWeekDays, nextworkingday.toDate())
          nextDayHolidayStatus = getWeekDayHolidayStatus(nonShippingDates, nextworkingday.toDate())
          if (nextDayStatus && !nextDayHolidayStatus) {
            shippingdate = moment(nextworkingday).toDate()
            break
          }
        }
      }
    }
    return shippingdate
  }

  const getWeekDayStatus = (usWeekDays: string, nextWorkingdate: Date) => {
    const curday = nextWorkingdate.getDay()
    //console.log(usWeekDays[curday]);
    return usWeekDays[curday]
  }

  const getWeekDayHolidayStatus = (nonShippingDates: string, nextWorkingdate: Date) => {
    const nonShippingDateArr = nonShippingDates.split(',')
    let holiday = false
    for (let i = 0; i < nonShippingDateArr.length; i++) {
      const thisDay: Date = new Date(nonShippingDateArr[i].trim())
      //console.log('thisDay:'+thisDay+'=nextWorkingdate:'+nextWorkingdate);
      if (
        thisDay.getDate() == nextWorkingdate.getDate() &&
        thisDay.getMonth() == nextWorkingdate.getMonth() &&
        thisDay.getFullYear() == nextWorkingdate.getFullYear()
      ) {
        holiday = true
        break
      }
    }
    return holiday
  }

  const getCountdown = (CountryCode: any, USShippingCutOffTime: any, CAShippingCutOffTime: any) => {
    const timeNow: any = new Date()
    let shippingTime = ''
    const month = String(timeNow.getMonth() + 1).padStart(2, '0')
    const dday = String(timeNow.getDate()).padStart(2, '0')

    if (CountryCode === 'United States') {
      shippingTime = `${timeNow.getFullYear()}-${month}-${dday}T${USShippingCutOffTime}`
    }

    // For now, Canada shipping cut-off logic is commented out
    // else if (CountryCode === 'Canada') {
    //     shippingTime = `${timeNow.getFullYear()}-${month}-${dday}T${CAShippingCutOffTime}`;
    // }

    const cutoffTime: any = new Date(shippingTime)
    let timeDifference: any = cutoffTime - timeNow

    // Function to format time difference
    const formatTime = (difference: number) => {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((Math.abs(difference) / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((Math.abs(difference) / (1000 * 60)) % 60)
      return { days, hours, minutes }
    }

    let countDown = ''

    if (timeDifference > 0) {
      const { days, hours, minutes } = formatTime(timeDifference)
      countDown = `${days > 0 ? days : ''}${
        hours > 0 ? hours + ' hours and ' : ''
      }${minutes} minutes`
    } else {
      // If the cutoff time has passed, extend it to the next day
      cutoffTime.setDate(cutoffTime.getDate() + 1)
      timeDifference = cutoffTime - timeNow

      const { days, hours, minutes } = formatTime(timeDifference)
      countDown = `${days > 0 ? days : ''}${
        hours > 0 ? hours + ' hours and ' : ''
      }${minutes} minutes`
    }

    return countDown
  }

  // Get inventory message based on current product and stock
  const inventoryResponse = getInventoryMessageText(product, stockAvailable)
  //console.log('inevntory message final', inventoryResponse)
  const MessageBox = ({ message }: { message: string }) => (
    <StyledBox>
      {skuStatus && skuStatus === 'Active' && (
        <span
          className="material-symbols-outlined responsiveShippingSpanIcon"
          style={{ fontSize: '28px', fontWeight: 500, lineHeight: '20px' }}
        >
          local_shipping
        </span>
      )}
      <Typography
        variant="body1"
        sx={{
          margin: '0 35px 0 10px',
          lineHeight: '25px',
          color: '#000000',
          fontSize: '16px',
          '@media (max-width: 910px)': { fontSize: '0.875rem', lineHeight: '1.375rem' },
        }}
      >
        {message}
      </Typography>
    </StyledBox>
  )

  return (
    <div>
      {inventoryResponse && inventoryResponse.inventoryMessage && (
        <MessageBox message={inventoryResponse.inventoryMessage} />
      )}
      {/* {availabilityMessageArr && <MessageBox message={availabilityMessageArr} />} */}
    </div>
  )
}

export default ProductInventoryMessages
