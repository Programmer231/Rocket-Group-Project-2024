import Layout from "@/components/Layout";
import React, { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";
import { useRouter } from "next/router";

const Room = () => {
  const router = useRouter();

  const handleCreateRoomButton = async () => {
    const res = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL + "/trivia/rooms/create",
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ name: "Test Room" }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await res.json();

    console.log(result);
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
      <button onClick={handleCreateRoomButton}>Create Room</button>
    </Layout>
  );
};

export default Room;
