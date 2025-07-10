// pages/api/validate-recaptcha.js

export default async function handler(req, res) {
  const { payLoad } = req.body
  const googleReCaptcha = payLoad?.googleReCaptcha
  const enableB2BAccountCreationRecaptcha = payLoad
    ? googleReCaptcha?.reCaptchAccountCreation
    : process.env.enableB2BAccountCreationRecaptcha
  const responseKey = payLoad?.responseKey
  const errorMsg = googleReCaptcha.accountCreationRecaptchaErrorMsg
    ? googleReCaptcha.accountCreationRecaptchaErrorMsg
    : process.env.accountCreationRecaptchaErrorMsg
  if (enableB2BAccountCreationRecaptcha && responseKey) {
    const projectId = process.env.recaptchaProjectId
    const apiKey = process.env.recaptchaApiKey
    const minScore = googleReCaptcha.minScore ? googleReCaptcha.minScore : process.env.minScore
    const siteKey = googleReCaptcha.accountCreationSiteKey
      ? googleReCaptcha.accountCreationSiteKey
      : process.env.accountCreationSiteKey
    // Construct the API URL
    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`
    // console.log('url', url)
    const requestData = {
      event: {
        token: responseKey,
        siteKey: siteKey,
        expectedAction: 'signup',
      },
    }
    try {
      // Make the request to validate recaptcha
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const recaptchaRespBody = await response.json()
      console.info('recaptchaRespBody=', recaptchaRespBody)

      if (
        !recaptchaRespBody?.tokenProperties?.valid ||
        (recaptchaRespBody?.riskAnalysis?.score &&
          parseFloat(recaptchaRespBody.riskAnalysis.score) < parseFloat(minScore))
      ) {
        console.error('Preventing account creation')
        console.error('Token validation', recaptchaRespBody.tokenProperties.valid)
        console.error('Token score', recaptchaRespBody.riskAnalysis.score)

        res.status(400).json({
          message: errorMsg,
          success: false,
        })
      } else {
        res.status(200).json({
          message: 'Recaptcha validated. Proceed with account creation.',
          success: true,
          score: recaptchaRespBody.riskAnalysis.score,
        })
      }
    } catch (error) {
      console.error('Error in recaptcha validation', error)
      res.status(500).json({
        message: 'Internal server error',
        success: false,
        error: error,
      })
    }
  } else {
    res.status(400).json({
      message: 'Missing required parameters',
      success: false,
    })
  }
}
