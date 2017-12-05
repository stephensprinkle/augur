export const UPDATE_REPORTS = 'UPDATE_REPORTS'
export const UPDATE_REPORT = 'UPDATE_REPORT'
export const CLEAR_REPORTS = 'CLEAR_REPORTS'

export const updateReports = reports => ({ type: UPDATE_REPORTS, reports })
export const updateReport = (universeID, marketID, report) => ({
  type: UPDATE_REPORT, universeID, marketID, report
})
export const clearReports = () => ({ type: CLEAR_REPORTS })
