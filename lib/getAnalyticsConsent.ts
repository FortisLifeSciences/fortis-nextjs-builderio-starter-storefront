export function getAnalyticsConsentFromLocalStorage(): boolean {
  try {
    const consentStr = window.localStorage.getItem('sp_consent')
    if (!consentStr) return false
    const consentArr = JSON.parse(consentStr)
    // Find the Analytics consent object
    const analyticsConsent = consentArr.find((c: any) => c.ComplianceType === 'Analytics')
    return analyticsConsent?.ConsentGiven === true
  } catch (e) {
    return false
  }
}
