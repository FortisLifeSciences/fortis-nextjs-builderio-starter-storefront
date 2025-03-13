import { getCookie, setCookie } from 'cookies-next'

export default async function handler(req, res) {
  let expiryDate
  const { payload } = req.body // Ensure `payload` is correctly destructured

  const countryCode = payload?.ipBasedCountryCode
  // console.log("Payload:", payload, "Country Code:", countryCode);
  // console.log("process.env.IP_WHO_IS_API_KEY:", process.env.IP_WHO_IS_API_KEY);

  try {
    const existingCookie = getCookie('ipBasedCountryCode', { req, res })

    if (!existingCookie || (typeof existingCookie === 'string' && existingCookie.trim() === '')) {
      expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + 1)

      if (countryCode && (countryCode === 'US' || countryCode === 'CA')) {
        setCookie('ipBasedCountryCode', countryCode, {
          req,
          res,
          expires: expiryDate,
          secure: true,
          httpOnly: true,
          sameSite: 'Strict',
        })

        return res.status(200).json({ success: true, message: 'retrieve country code from theme' })
      } else {
        // Fallback: Detect country from IP
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipResponse.json()

        const ipWhoisResponse = await fetch(
          `https://ipwhois.app/json/${ipData.ip}?key=${process.env.IP_WHO_IS_API_KEY}`
        )
        const ipWhoisData = await ipWhoisResponse.json()

        // console.log("IP Data:", ipWhoisData);

        if (ipWhoisData?.country_code) {
          setCookie('ipBasedCountryCode', ipWhoisData.country_code, {
            req,
            res,
            expires: expiryDate,
            secure: true,
            httpOnly: true,
            sameSite: 'Strict',
          })

          return res
            .status(200)
            .json({
              success: true,
              message: 'retrieve country code from IPWhois',
              ipWhoisData: ipWhoisData,
              ip: ipData.ip,
              apikey: process.env.IP_WHO_IS_API_KEY,
            })
        } else {
          return res.status(500).json({
            success: false,
            message: 'Failed to retrieve country code from IPWhois',
          })
        }
      }
    } else {
      return res.status(200).json({ success: true, message: 'Cookie already exists' })
    }
  } catch (error) {
    console.error('Error fetching IP-based country code:', error)

    // Fallback: Set to 'US' if error occurs
    setCookie('ipBasedCountryCode', 'US', {
      req,
      res,
      expires: expiryDate,
      secure: true,
      httpOnly: true,
      sameSite: 'Strict',
    })

    return res.status(500).json({
      message: 'Internal server error',
      success: false,
    })
  }
}
