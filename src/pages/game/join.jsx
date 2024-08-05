import Layout from "@/components/Layout";
import {
  Card,
  CardHeader,
  CardDescription,
  CardFooter,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { io } from "socket.io-client";
import { getSocket } from "@/lib/socket-helper";

const viewRooms = () => {
  const [rooms, setRooms] = useState([]);
  const socket = getSocket();

  const router = useRouter();

  const getRooms = async () => {
    const res = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL + "/trivia/rooms/get"
    );

    const rooms = await res.json();

    setRooms(rooms.rooms);
  };

  const joinRoom = async (roomId) => {
    router.push(`/room/view?roomId=${roomId}`);
  };

  const isAuthenticated = async () => {
    const res = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL + "/trivia/user/getUser",
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (res.status == 401) {
      router.push("/login");
    }
  };

  useEffect(() => {
    getRooms();
    isAuthenticated();
  }, []);
  return (
    <Layout>
      {rooms.map((room) => {
        return (
          <Card className="w-1/2 mx-auto mt-[50px]" key={room._id}>
            <CardHeader>
              <CardTitle>Room Name</CardTitle>
              <CardDescription>
                Players:{" "}
                {room.users.map((user, index) => {
                  return (
                    <p className="inline" key={user._id}>
                      {user.username},
                    </p>
                  );
                })}
              </CardDescription>
            </CardHeader>
            <CardContent></CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={() => joinRoom(room._id)}>Join</Button>
            </CardFooter>
          </Card>
        );
      })}
    </Layout>
  );
};

export default viewRooms;
