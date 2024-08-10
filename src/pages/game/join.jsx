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
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { io } from "socket.io-client";
import ClockLoader from "react-spinners/ClockLoader";

const ViewRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [currentUser, setCurrentUser] = useState();

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

  const isAuthenticated = useCallback(async () => {
    const res = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL + "/trivia/user/getUser",
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (res.status == 401) {
      router.push("/login");
    } else {
      const user = await res.json();
      console.log(user);

      setCurrentUser(user.user);
    }
  }, []);

  useEffect(() => {
    getRooms();
    isAuthenticated();
  }, [isAuthenticated]);
  return (
    <Layout>
      {rooms.map((room) => {
        return (
          <Card className="w-1/2 mx-auto mt-[50px]" key={room._id}>
            <CardHeader>
              <CardTitle>{room.name}</CardTitle>
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
              <div className="flex flex-row justify-between w-full">
                {currentUser &&
                room &&
                (!room.inProgress ||
                  room.users.some((user) => currentUser._id == user._id)) ? (
                  <Button onClick={() => joinRoom(room._id)}>Join</Button>
                ) : null}
                {room.inProgress ? (
                  <div className="flex flex-row gap-[5px] items-center">
                    <ClockLoader />
                    <p className="text-slate-500">In Progress</p>
                  </div>
                ) : null}
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </Layout>
  );
};

export default ViewRooms;
