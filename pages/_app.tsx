import { ChakraProvider } from '@chakra-ui/react'
import { D } from '@mobily/ts-belt'
import { Hydrate, QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { Session } from 'next-auth'
import { SessionProvider, signIn } from "next-auth/react"
import type { AppProps } from 'next/app'
import { useState } from 'react'
import { useApi } from '../hooks/useApi'


interface Props {
  Component: {
    auth?: boolean
  }
}

function MyApp({ Component, pageProps }: AppProps & Props) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchInterval: 1000 * 60 * 5,
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient} contextSharing={true}>
      <Hydrate state={pageProps.dehydratedState}>
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
      </Hydrate>
    </QueryClientProvider>
  )
}

export default MyApp


function Auth({ children }: { children: any }) {
  const { get } = useApi("/api/auth/")
  const { data, isSuccess } = useQuery(["session"], () => get<Session>("session"), {
    refetchInterval: 1000 * 60 * 5,
    onSuccess(data) {
      if (D.isEmpty(data)) signIn()
    },
  });

  if (isSuccess && D.isNotEmpty(data)) {
    return children
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <div>Loading...</div>
}

