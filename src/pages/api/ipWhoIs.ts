import * as cookieNext from 'cookies-next'

const IpWhoIs = async (countryCode: string) => {
  let expiryDate: any
  try {
    const ipWhoIsApiKey = process.env.IP_WHO_IS_API_KEY
    const existingCookie = cookieNext.getCookie('ipBasedCountryCode')

    if (!existingCookie || (typeof existingCookie === 'string' && existingCookie.trim() === '')) {
      expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + 1)

      // Make sure countryCode is not undefined or null
      if (countryCode && (countryCode === 'US' || countryCode === 'CA')) {
        cookieNext.setCookie('ipBasedCountryCode', countryCode, {
          expires: expiryDate,
          secure: true,
        })
      } else {
        // Fallback to IP-based country detection
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()

        const res = await fetch(`https://ipwhois.app/json/${data.ip}?key=${ipWhoIsApiKey}`)
        const ipData = await res.json()

        cookieNext.setCookie('ipBasedCountryCode', ipData.country_code, {
          expires: expiryDate,
          secure: true,
        })
      }
    }
  } catch (error) {
    cookieNext.setCookie('ipBasedCountryCode', 'US', {
      expires: expiryDate,
      secure: true,
    })
    console.error('Error fetching IP-based country code:', error)
  }
}

export default IpWhoIs
