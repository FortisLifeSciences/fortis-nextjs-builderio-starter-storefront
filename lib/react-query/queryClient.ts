import { QueryClient, MutationCache, QueryCache } from '@tanstack/react-query'

const getErrorMessage = (code: string, message: string) => {
  const messages: any = {
    GRAPHQL_VALIDATION_FAILED: 'Something went wrong',
    UNAUTHENTICATED: 'Invalid Credentials',
  }

  return message || messages[code]
}

const parseGraphQLError = (errorString: any) => {
  try {
    // Find the position of the JSON object in the error string
    if (typeof errorString !== 'string') {
      errorString = JSON.stringify(errorString)
    }
    const jsonStartIndex = errorString.indexOf('{"response":')

    // Extract and parse the JSON
    if (jsonStartIndex !== -1) {
      const jsonPart = errorString.slice(jsonStartIndex)
      const parsedJson = JSON.parse(jsonPart)
      return parsedJson
    } else {
      return null
    }
  } catch (error) {
    console.error('Error parsing GraphQL error:', error)
    return null
  }
}

const queryClientHandler = (error: any, showSnackbar: any) => {
  if (!showSnackbar) return
  const status = 'error'

  const parsedError = parseGraphQLError(error)
  const statusCode = error?.response?.status
    ? error?.response?.status
    : parsedError?.response?.status

  if (
    statusCode !== '405' &&
    statusCode !== '409' &&
    statusCode !== '500' &&
    !(error instanceof SyntaxError && error.message.includes('Unexpected token'))
  ) {
    console.warn('API Error:', error) // Log only for other errors
  }

  if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
    //do nothing here for now
  } else if (
    parsedError?.response?.status === '405' ||
    error?.response?.error === '' ||
    parsedError?.response?.message ===
      'Validation Error: The Shipping Info address information must be filled in before shipping rates can be determined.' ||
    parsedError?.response?.message === 'Validation Error: update exception' ||
    statusCode === '409'
  ) {
    //do nothing here for now
  } else {
    showSnackbar(getErrorMessage(error?.response?.code, error?.response?.message), status)
  }
}

export const generateQueryClient = (showSnackbar?: any): QueryClient => {
  const mutationCache = new MutationCache({
    onError: (error) => queryClientHandler(error, showSnackbar),
  })

  const queryCache = new QueryCache({
    onError: (error) => queryClientHandler(error, showSnackbar),
  })

  return new QueryClient({ mutationCache, queryCache })
}

export const queryClient = generateQueryClient()
