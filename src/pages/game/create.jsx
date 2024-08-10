import Layout from "@/components/Layout";
import React, { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Room = () => {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");

  const setRoomNameHandler = (value) => {
    setRoomName(value);
  };
  const handleCreateRoomButton = async (event) => {
    event.preventDefault();
    const res = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL + "/trivia/rooms/create",
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ name: roomName }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    router.push("/game/join");
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
    isAuthenticated();
  }, []);
  return (
    <Layout>
      <form
        className="w-1/2 bg-white flex flex-col text-black m-auto p-9 mt-20 gap-10 rounded-xl shadow-lg"
        onSubmit={(event) => {
          handleCreateRoomButton(event);
        }}
      >
        <div className="w-full">
          <Label>Room Name</Label>
          <Input
            className="w-full"
            onChange={(event) => setRoomNameHandler(event.target.value)}
            value={roomName}
          />
        </div>

        <Button
          className="w-1/2 m-auto bg-primary text-primary-foreground"
          type="submit"
        >
          Create Room
        </Button>
      </form>
    </Layout>
  );
};

export default Room;
