import { Box, Button, Flex, Input, InputGroup, InputLeftAddon, Stack, Text } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { ChangeEvent, useState } from "react";

const getSession = () => fetch('/api/auth/session').then(res => (res.json() as Promise<Session>));

export const UserCard = () => {
    const { data: user, isSuccess, isLoading } = useQuery(["session"], getSession, {
        select(data) {
            const user = data.user;
            return user || {};
        }

    });

    return <Flex w="20rem" fontSize={"2xl"} flexDir={"column"} borderColor="black" borderStyle="solid" borderWidth={1} borderRadius="md" h={"min-content"} p={2}>
        <Stack spacing={4}>
            <Text fontSize={"3xl"} textTransform={"capitalize"}>user info</Text>

            <UserCardInfo isLoading={isLoading} isSuccess={isSuccess} user={user} />
        </Stack>
    </Flex>;
};

const sendUserUpdate = ({ username, email }: { username: string, email: string }) => fetch('/api/user/options/userUpdate', {
    method: 'POST',
    body: JSON.stringify({ username, email }),
}).then(res => res.json());

const UserCardInfo = (props: { user: Session["user"] | undefined; isSuccess: boolean; isLoading: boolean; }) => {
    const { isLoading, isSuccess, user } = props;
    const [editMode, setEditMode] = useState(false);
    const [eidtData, setEditData] = useState({ username: user?.name, email: user?.email });
    const queryClient = useQueryClient();
    const { mutate } = useMutation(sendUserUpdate, { 
        onSuccess: () => {
            queryClient.refetchQueries(["session"]);
            setEditMode(false)
        }
     });

    const handleEdit = () => {
        if (eidtData.email && eidtData.username) {
            const { username, email } = eidtData;

            mutate({ username, email });


        }
    }

    const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEditData({ ...eidtData, [e.target.name]: e.target.value });
    }


    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!isSuccess || !user) {
        return <Text>Error</Text>;
    }

    if (editMode) {
        return (
            <>
                <InputGroup>
                    <InputLeftAddon><Text>Username</Text></InputLeftAddon>
                    <Input type='text' name="username" value={eidtData.username || undefined} onChange={handleEditChange} />
                </InputGroup>

                <InputGroup>
                    <InputLeftAddon><Text>Email</Text></InputLeftAddon>
                    <Input type='email' name="email" value={eidtData.email || undefined} onChange={handleEditChange} />
                </InputGroup>

                <Flex mt={3} flexDir={"column"} display={"flex"}>
                    <Button borderRadius={0} borderTopLeftRadius={"md"} borderTopRightRadius={"md"} w="full" colorScheme={"blue"} onClick={handleEdit}>save</Button>
                    <Button borderRadius={0} borderBottomLeftRadius={"md"} borderBottomRightRadius={"md"} w="full" colorScheme={"red"} onClick={() => setEditMode(pre => !pre)}>dont save</Button>
                </Flex>
            </>
        )
    }

    return (
        <>
            <Box>
                <Text>Username: {user.name}</Text>

                <Text>Email: {user.email}</Text>
            </Box>

            <Flex flexDir={"column"}>
                <Button borderRadius={0} borderTopLeftRadius={"md"} borderTopRightRadius={"md"} w="full" colorScheme={"blue"} onClick={() => setEditMode(pre => !pre)}>Edit</Button>
                <Button borderRadius={0} borderBottomLeftRadius={"md"} borderBottomRightRadius={"md"} w="full" colorScheme={"red"} onClick={() => signOut()}>log out</Button>
            </Flex>
        </>)
};
