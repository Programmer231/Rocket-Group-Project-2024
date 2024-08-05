import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { io } from "socket.io-client";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import s from "../../styles/embla.module.css";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { Button } from "@/components/ui/button";

const viewRooms = () => {
  const OPTIONS = { loop: true, axis: "y" };
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS, [
    AutoScroll({ playOnInit: true, stopOnInteraction: false, startDelay: 0 }),
  ]);
  const [isPlaying, setIsPlaying] = useState(false);

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const autoScroll = emblaApi?.plugins()?.autoScroll;
    if (!autoScroll) return;

    setIsPlaying(autoScroll.isPlaying());
    emblaApi.on("autoScroll:play", () => setIsPlaying(true));
  }, [emblaApi]);

  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [host, setHost] = useState(null);
  const [rejoinUrl, setRejoinUrl] = useState("");

  const getRejoinUrl = async () => {
    if (router.isReady) {
      const res = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL +
          `/trivia/rooms/getMatchByRoomId/?roomId=${router.query.roomId}`,
        {
          credentials: "include",
          method: "GET",
        }
      );

      const match = await res.json();

      console.log(match);

      if (match.match) {
        console.log(match);
        setRejoinUrl(match.match._id);
      } else {
        setRejoinUrl("");
      }
    }
  };

  const rejoinGame = async () => {
    router.push(
      `/match/play?roomId=${router.query.roomId}&matchId=${rejoinUrl}`
    );
  };

  const isAuthenticated = async () => {
    const res = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL + "/trivia/user/getUser",
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (res.status === 401) {
      router.push("/login");
      return;
    }

    const user = await res.json();
    setCurrentUser(user.user);
  };

  const getUsers = async () => {
    if (!router.query.roomId) return;

    const res = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL +
        `/trivia/rooms/getPlayers?roomId=${router.query.roomId}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );

    const fetchedUsers = await res.json();

    if (fetchedUsers.playerInfo) {
      setUsers(fetchedUsers.playerInfo);
      setHost(fetchedUsers.host);
    }
  };

  const startGame = async () => {
    if (!socket) return;
    await socket.emit("startMatch", router.query.roomId, null);
  };

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      isAuthenticated();
      getUsers();

      socket.on("send-room-joined", (userId, username, userImage) => {
        toast(`User ${username} has joined!`, {
          description: "Welcome to the Room",
        });
        setUsers((prevState) => {
          for (let item of prevState) {
            if (item.userId === userId) return prevState;
          }
          return [...prevState, { username, userId, userImage }];
        });
      });

      socket.emit("joinRoom", router.query.roomId);

      socket.on("send-go-to-game", (matchId) => {
        router.push(
          `/match/play?roomId=${router.query.roomId}&matchId=${matchId}`
        );
      });

      setSocket(socket);
      getRejoinUrl();
    });

    return () => {
      socket.disconnect();
    };
  }, [router.query.roomId]);

  return (
    <div>
      <Layout>
        <div className={s.embla}>
          <div className={s.embla__viewport} ref={emblaRef}>
            <div className={s.embla__container}>
              {users.map((user) => (
                <div className={s.embla__slide} key={user.userId}>
                  <div className={s.embla__slide__number}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "20px",
                        width: "100%",
                      }}
                      className="shadow-lg"
                    >
                      <img
                        src={user.userImage}
                        width={"200px"}
                        height={"200px"}
                      />
                      <p>{user.username}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {rejoinUrl == "" ? (
          currentUser &&
          currentUser._id === host && (
            <div className="m-auto w-1/2 mt-[50px]">
              <Button className="w-full rounded-xl" onClick={startGame}>
                Start Game
              </Button>
            </div>
          )
        ) : (
          <div className="m-auto w-1/2 mt-[50px]">
            <Button className="w-full rounded-xl" onClick={rejoinGame}>
              Rejoin Game
            </Button>
          </div>
        )}
      </Layout>
    </div>
  );
};

export default viewRooms;
