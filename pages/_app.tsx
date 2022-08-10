import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider, Hydrate, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider, signIn } from "next-auth/react"
import { useState } from 'react'
import type { Session } from 'next-auth'
import { D } from '@mobily/ts-belt'


interface Props {
  Component: {
    auth?: boolean
  }
}

function MyApp({ Component, pageProps }: AppProps & Props) {
  const [queryClient] = useState(() => new QueryClient())

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

const getSession = () => fetch('/api/auth/session').then(res => (res.json() as Promise<Session>));

function Auth({ children }: { children: any }) {
  const { data, isSuccess } = useQuery(["session"], getSession, {
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

