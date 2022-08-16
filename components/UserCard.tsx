import { Box, Button, Flex, Input, InputGroup, InputLeftAddon, Stack, Text } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { ChangeEvent, useEffect, useState } from "react";

const getSession = () => fetch('/api/auth/session').then(res => (res.json() as Promise<Session>));

export const UserCard = () => {
    const { data: user, isSuccess, isLoading } = useQuery(["session"], getSession, {
        select(data) {
            const user = data.user;
            return user;
        }
    });

    if (!user) {
        return null;
    }

    return (
        <Flex w="20rem" fontSize={"2xl"} flexDir={"column"} borderColor="black" borderStyle="solid" borderWidth={1} borderRadius="md" h={"min-content"} p={2}>
            <Stack spacing={4}>
                <Text fontSize={"3xl"} textTransform={"capitalize"}>user info</Text>

                <UserCardInfo isLoading={isLoading} isSuccess={isSuccess} user={user} />
            </Stack>
        </Flex>
    )
};

const sendUserUpdate = ({ username, email }: { username: string, email: string }) => fetch('/api/user/options/userUpdate', {
    method: 'POST',
    body: JSON.stringify({ username, email }),
    headers: { 'Content-Type': 'application/json' }
}).then(res => res.json());

const UserCardInfo = (props: { user: Session["user"] | undefined; isSuccess: boolean; isLoading: boolean; }) => {

    const [editMode, setEditMode] = useState(false);
    const [eidtData, setEditData] = useState({ username: "", email: "" });
    const queryClient = useQueryClient();
    const { mutate } = useMutation(sendUserUpdate);

    const handleEdit = () => {
        if (eidtData.email && eidtData.username) {
            const { username, email } = eidtData;

            mutate({ username, email }, {
                onSuccess: () => {
                    queryClient.invalidateQueries(["session"]);
                    setEditMode(false)
                }
            });
        }
    }

    const changeEditMode = () => {
        if (editMode == false && props.user?.name && props.user?.email) {
            setEditMode(true);

            setEditData({ username: props.user.name, email: props.user.email });
        }
        else {
            setEditMode(false);
        }
    }

    const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEditData({ ...eidtData, [e.target.name]: e.target.value });
    }

    if (props.isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!props.isSuccess || !props.user) {
        return <Text>Error</Text>;
    }

    if (editMode) {
        return (
            <>
                <InputGroup>
                    <InputLeftAddon><Text>Username</Text></InputLeftAddon>
                    <Input type='text' name="username" value={eidtData.username} onChange={handleEditChange} />
                </InputGroup>

                <InputGroup>
                    <InputLeftAddon><Text>Email</Text></InputLeftAddon>
                    <Input type='email' name="email" value={eidtData.email} onChange={handleEditChange} />
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
                <Text>Username: {props.user.name}</Text>

                <Text>Email: {props.user.email}</Text>
            </Box>

            <Flex flexDir={"column"}>
                <Button borderRadius={0} borderTopLeftRadius={"md"} borderTopRightRadius={"md"} w="full" colorScheme={"blue"} onClick={changeEditMode}>Edit</Button>
                <Button borderRadius={0} borderBottomLeftRadius={"md"} borderBottomRightRadius={"md"} w="full" colorScheme={"red"} onClick={() => signOut()}>log out</Button>
            </Flex>
        </>)
};
