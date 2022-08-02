import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider, useSession } from "next-auth/react"


interface Props {
  Component: {
    auth?: boolean
  }
}

function MyApp({ Component, pageProps }: AppProps & Props) {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient} contextSharing={true}>
      <SessionProvider session={pageProps.session} refetchOnWindowFocus>
        <ChakraProvider>


          {
            Component.auth ? (
              <Auth>
                <Component {...pageProps} />
              </Auth>
            ) : <Component {...pageProps} />
          }


        </ChakraProvider>
      </SessionProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default MyApp


function Auth({ children }: { children: any }) {
  const { data } = useSession({ required: true })

  if (data) {
    return children
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <div>Loading...</div>
}