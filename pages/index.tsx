import { Flex } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import Layout from '../components/layout'
import { useFilter } from '../hooks/useFilter'

const index = () => {
  const { data } = useSession()

  return (
    <Layout>
      <Flex flexDir={"column"} p={2}>

      </Flex>
    </Layout>
  )
}

index.auth = true

export default index




