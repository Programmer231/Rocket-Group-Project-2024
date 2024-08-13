import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { io } from "socket.io-client";
import { useRouter } from "next/router";
import { toast } from "sonner";
import s from "../../styles/embla.module.css";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TRIVIA_CATEGORIES = [
  { id: 0, name: "Random" },
  { id: 9, name: "General Knowledge" },
  { id: 10, name: "Entertainment: Books" },
  { id: 11, name: "Entertainment: Film" },
  { id: 12, name: "Entertainment: Music" },
  { id: 13, name: "Entertainment: Musicals & Theatres" },
  { id: 14, name: "Entertainment: Television" },
  { id: 15, name: "Entertainment: Video Games" },
  { id: 16, name: "Entertainment: Board Games" },
  { id: 17, name: "Science & Nature" },
  { id: 18, name: "Science: Computers" },
  { id: 19, name: "Science: Mathematics" },
  { id: 20, name: "Mythology" },
  { id: 21, name: "Sports" },
  { id: 22, name: "Geography" },
  { id: 23, name: "History" },
  { id: 24, name: "Politics" },
  { id: 25, name: "Art" },
  { id: 26, name: "Celebrities" },
  { id: 27, name: "Animals" },
  { id: 28, name: "Vehicles" },
  { id: 29, name: "Entertainment: Comics" },
  { id: 30, name: "Science: Gadgets" },
  { id: 31, name: "Entertainment: Japanese Anime & Manga" },
  { id: 32, name: "Entertainment: Cartoon & Animations" },
];

const DIFFICULTIES = ["Any", "easy", "medium", "hard"];

const ViewRooms = () => {
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
  const [difficulty, setDifficulty] = useState("Any");
  const [category, setCategory] = useState("Random");
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [roomName, setRoomName] = useState("");

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
      setRoomName(fetchedUsers.roomName);
    }
  };

  const startGame = async () => {
    if (!socket) return;
    await socket.emit(
      "startMatch",
      router.query.roomId,
      numberOfQuestions,
      category,
      difficulty
    );
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
    <>
      <Layout>
        <div className="flex flex-col justify-start mt-[50px] items-center gap-[100px]">
          <h1 className="font-bold text-5xl">{roomName}</h1>
          {currentUser && currentUser._id == host ? (
            <div className="flex flex-row justify-center gap-[50px]">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Set Category</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-h-[400px] overflow-y-scroll">
                  <DropdownMenuLabel>Categories</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={category}
                    onValueChange={setCategory}
                    className=""
                  >
                    {TRIVIA_CATEGORIES.map((category) => {
                      return (
                        <DropdownMenuRadioItem
                          value={category.name}
                          key={category.id}
                        >
                          {category.name}
                        </DropdownMenuRadioItem>
                      );
                    })}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Set Difficulty</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Difficulties</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={difficulty}
                    onValueChange={setDifficulty}
                  >
                    {DIFFICULTIES.map((difficulty) => {
                      return (
                        <DropdownMenuRadioItem
                          value={difficulty}
                          key={difficulty}
                        >
                          {difficulty}
                        </DropdownMenuRadioItem>
                      );
                    })}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Set Number of Questions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Question Number</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={numberOfQuestions}
                    onValueChange={setNumberOfQuestions}
                  >
                    {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map(
                      (questionNumber) => {
                        return (
                          <DropdownMenuRadioItem
                            value={questionNumber}
                            key={questionNumber}
                          >
                            {questionNumber}
                          </DropdownMenuRadioItem>
                        );
                      }
                    )}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}
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
                          pointerEvents: "none",
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
              <div className="m-auto w-1/2">
                <Button className="w-full rounded-xl" onClick={startGame}>
                  Start Game
                </Button>
              </div>
            )
          ) : currentUser &&
            users &&
            users.some((user) => user.userId == currentUser._id) ? (
            <div className="m-auto w-1/2">
              <Button className="w-full rounded-xl" onClick={rejoinGame}>
                Rejoin Game
              </Button>
            </div>
          ) : null}
        </div>
      </Layout>
    </>
  );
};

export default ViewRooms;
