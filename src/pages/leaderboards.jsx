import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

const LeaderBoards = () => {
  const [users, setUsers] = useState([]);
  const getUser = async () => {
    const res = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL + "/trivia/user/leaderboards",
      {
        credentials: "include",
        method: "GET",
      }
    );

    const users = await res.json();

    let sortedUsers = [...users.users].sort((user1, user2) => {
      if (
        user1.totalWins > 0 &&
        user2.totalWins > 0 &&
        user1.totalLosses > 0 &&
        user2.totalLosses > 0
      ) {
        return (
          user2.totalWins / user2.totalLosses -
          user1.totalWins / user1.totalLosses
        );
      } else {
        return user2.totalWins - user1.totalWins;
      }
    });

    setUsers(sortedUsers);
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <Layout>
      <div className="mt-[50px] w-[80%] m-auto">
        <h1 className="text-3xl text-center font-bold">Leaderboards</h1>
        {users.map((user) => (
          <div
            className="flex flex-row p-[30px] shadow-lg justify-between"
            key={user._id}
          >
            <div className="flex flex-col justify-start items-center">
              <img
                src={user.image}
                alt={`User ${user.username} image`}
                width={"100px"}
                height={"100px"}
              />
              <h1>{user.username}</h1>
            </div>
            <div className="flex flex-row gap-[30px]">
              <div className="flex flex-col justify-start items-center">
                <h1 className="underline font-bold">W</h1>
                <h2>{user.totalWins}</h2>
              </div>
              <div className="flex flex-col justify-start items-center">
                <h1 className="underline font-bold">L</h1>
                <h2>{user.totalLosses}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default LeaderBoards;
