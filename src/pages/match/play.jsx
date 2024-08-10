import React, { useCallback, useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { io } from "socket.io-client";
import he from "he";
import { Button } from "@/components/ui/button";
import ErrorComponent from "@/components/Error";
import { toast } from "sonner";

const Match = (props) => {
  const [socket, setSocket] = useState();

  const [question, setQuestion] = useState();
  const [answers, setAnswers] = useState([]);
  const [userCorrectAnswers, setUserCorrectAnswers] = useState([]);
  const [host, setHost] = useState("");
  const [userId, setUserId] = useState();
  const [matchQuestions, setMatchQuestions] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [error, setError] = useState();

  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const [endGameLoading, setEndGameLoading] = useState(false);

  const [matchCategory, setMatchCategory] = useState("");
  const [matchDifficulty, setMatchDifficulty] = useState("");

  const router = useRouter();

  const submitAnswer = () => {
    if (currentQuestion < matchQuestions) {
      socket.emit(
        "answerQuestion",
        router.query.matchId,
        answers[selectedAnswer]
      );
      setCurrentQuestion((prevState) => prevState + 1);
    } else {
      setCurrentQuestion((prevState) => prevState + 1);
    }
  };

  const endGame = () => {
    setEndGameLoading(true);
    socket.emit("endMatch", router.query.roomId, router.query.matchId);
  };

  const getMatch = async () => {
    if (router.isReady) {
      const res = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL +
          `/trivia/rooms/getMatchWithoutQuestions/?matchId=${router.query.matchId}`,
        { credentials: "include", method: "GET" }
      );

      if (!res.ok) {
        const error = await res.json();

        setError({ message: error.message, status: res.status });
      } else {
        const match = await res.json();

        if (!match.match) {
          setError({ message: "Couldn't find match", status: 404 });
        } else {
          setMatchQuestions(match.match.numberOfQuestions);
          setMatchCategory(he.decode(match.match.category));
          setMatchDifficulty(he.decode(match.match.difficulty));
        }
      }
    }
  };

  const getFirstQuestion = async () => {
    if (router.isReady) {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_SERVER_URL +
            `/trivia/rooms/allMatchUsers/?matchId=${router.query.matchId}`,
          { credentials: "include", method: "GET" }
        );

        const result = await res.json();

        let users;

        users = result.userCorrectAnswers;

        const getUserId = await getUser();

        setUserId(getUserId.user._id);

        for (let user of users) {
          if (user.userInformation._id == getUserId.user._id) {
            setCurrentQuestion(user.currentQuestionNumber);
          }
        }

        users = users.sort((user1, user2) => {
          if (
            user1.currentQuestionNumber > 0 &&
            user2.currentQuestionNumber > 0
          ) {
            return (
              user2.correctAnswers / user2.currentQuestionNumber -
              user1.correctAnswers / user1.currentQuestionNumber
            );
          } else {
            return user2.correctAnswers - user1.correctAnswers;
          }
        });

        setUserCorrectAnswers([...users]);
      } catch (err) {
        console.log(err);
      }
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_SERVER_URL +
            `/trivia/rooms/firstQuestion/?matchId=${router.query.matchId}`,
          { credentials: "include", method: "GET" }
        );

        if (!res.ok) {
          const error = await res.json();
          const newError = new Error(error.message);
          newError.status = 409;
          throw newError;
        }

        let question = await res.json();

        const cleanedAnswers = [];

        for (let answer of question.answers) {
          cleanedAnswers.push(he.decode(answer));
        }

        setCategory(he.decode(question.category));
        setDifficulty(he.decode(question.difficulty));
        setQuestion(he.decode(question.question));
        setAnswers([...cleanedAnswers]);
      } catch (err) {
        console.log(err);
        if (err.status == 409) {
          if (router.isReady) {
            const res = await fetch(
              process.env.NEXT_PUBLIC_SERVER_URL +
                `/trivia/rooms/getMatchWithoutQuestions/?matchId=${router.query.matchId}`,
              { credentials: "include", method: "GET" }
            );

            const match = await res.json();
            if (!match.match) {
              setError({ message: "Couldn't find Match", status: 404 });
            } else {
              setMatchQuestions(match.match.numberOfQuestions);
              setCurrentQuestion(match.match.numberOfQuestions);
            }
          }
        } else {
          setError({ message: err.message, status: err.status });
        }
      }
    }
  };

  const getUser = async () => {
    if (router.isReady) {
      const res = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + "/trivia/user/getUser",
        { method: "GET", credentials: "include" }
      );

      const user = await res.json();

      return user;
    }
  };

  const getHost = async () => {
    if (router.isReady) {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_SERVER_URL +
            `/trivia/rooms/getPlayers/?roomId=${router.query.roomId}`,
          { method: "GET", credentials: "include" }
        );

        if (!res.ok) {
          const error = await res.json();

          setError({ message: error.message, status: res.status });
        }

        const users = await res.json();

        setHost(users.host);
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("connect", (socket) => {
      console.log(socket);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    getFirstQuestion();

    getMatch();

    getHost();

    setSocket(socket);

    socket.emit("joinMatch", router.query.matchId);

    socket.on("nextQuestion", (question) => {
      if (!question) {
        return;
      }
      const cleanedAnswers = [];

      for (let answer of question.answers) {
        cleanedAnswers.push(he.decode(answer));
      }

      setCategory(he.decode(question.category));
      setDifficulty(he.decode(question.difficulty));
      setQuestion(he.decode(question.question));
      setSelectedAnswer(-1);
      setAnswers([...cleanedAnswers]);
    });

    socket.on("send-go-to-lobby", () => {
      router.replace(`/match/summary/?matchId=${router.query.matchId}`);
    });

    socket.on("questionResult", (userId, answerStatus) => {
      setUserCorrectAnswers((prevState) => {
        let indexOfUserUpdate = prevState.findIndex((user) => {
          return user.userInformation._id == userId;
        });

        let newUsers = [...prevState];

        if (answerStatus) {
          toast("CORRECT ANSWER", {
            variant: "destructive",
            description: `User ${
              newUsers[indexOfUserUpdate].userInformation.username
            } has answered question ${
              newUsers[indexOfUserUpdate].currentQuestionNumber + 1
            } correctly!`,
          });

          newUsers[indexOfUserUpdate].correctAnswers += 1;
          newUsers[indexOfUserUpdate].currentQuestionNumber += 1;

          newUsers = newUsers.sort((user1, user2) => {
            if (
              user1.currentQuestionNumber > 0 &&
              user2.currentQuestionNumber > 0
            ) {
              return (
                user2.correctAnswers / user2.currentQuestionNumber -
                user1.correctAnswers / user1.currentQuestionNumber
              );
            } else {
              return user2.correctAnswers - user1.correctAnswers;
            }
          });
          return [...newUsers];
        } else {
          toast("INCORRECT ANSWER", {
            variant: "destructive",
            description: `User ${
              newUsers[indexOfUserUpdate].userInformation.username
            } has answered question ${
              newUsers[indexOfUserUpdate].currentQuestionNumber + 1
            } incorrectly!`,
          });
          newUsers[indexOfUserUpdate].currentQuestionNumber += 1;
          newUsers = newUsers.sort((user1, user2) => {
            if (
              user1.currentQuestionNumber > 0 &&
              user2.currentQuestionNumber > 0
            ) {
              return (
                user2.correctAnswers / user2.currentQuestionNumber -
                user1.correctAnswers / user1.currentQuestionNumber
              );
            } else {
              return user2.correctAnswers - user1.correctAnswers;
            }
          });

          return [...newUsers];
        }
      });
    });

    return () => {
      socket.disconnect();
      console.log("Disconnected from WebSocket server");
    };
  }, [router.query.matchId, router.query.roomId]);

  return (
    <>
      {error ? (
        <ErrorComponent message={error.message} status={error.status} />
      ) : null}
      <Layout>
        <div className="mt-[50px] text-center w-full">
          <h1 className="font-bold text-5xl">TIME TO BATTLE!</h1>
          <div className="mt-[100px] flex flex-row justify-between items-center w-[80%] m-auto">
            <h1 className="font-medium text-xl">
              Current Question Number: {currentQuestion}/{matchQuestions}
            </h1>
            <div>
              <h1 className="font-medium text-xl">
                Category - {matchCategory}
              </h1>
              <h1 className="font-medium text-xl">
                {" "}
                Difficulty: {matchDifficulty}
              </h1>
            </div>
          </div>
        </div>

        <>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "start",
              width: "90%",
              margin: "auto",
              backgroundColor: "transparent",
              marginTop: "100px",
            }}
          >
            {currentQuestion >= matchQuestions ? (
              <h1>Waiting for the Host to end the game to record results...</h1>
            ) : (
              <div className="shadow-lg p-[50px] w-1/2">
                <div className="flex flex-col gap-[50px] items-center justify-start">
                  <div className="flex flex-row justify-between w-[90%]">
                    <h1>Category - {category}</h1>
                    <h1
                      className={`${
                        difficulty == "easy"
                          ? "text-green-500"
                          : difficulty == "medium"
                          ? "text-yellow-300"
                          : difficulty == "hard"
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      Difficulty: {difficulty.toUpperCase()}
                    </h1>
                  </div>
                  <h1 className="text-center font-bold">{question}</h1>
                  <div className="flex flex-col justify-center gap-[20px] w-full">
                    {answers.map((answer, idx) => {
                      return (
                        <div
                          key={idx}
                          className={`${
                            selectedAnswer == idx
                              ? "flex flex-row w-[50%] border-2 border-blue justify-between m-auto cursor-pointer p-[10px] rounded-xl"
                              : "flex flex-row w-[50%] justify-between m-auto cursor-pointer p-[10px] rounded-xl"
                          }`}
                          onClick={() => {
                            setSelectedAnswer(idx);
                          }}
                        >
                          <h2>{["A)", "B)", "C)", "D)"][idx]}</h2>
                          <h2>{answer}</h2>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <Button
                      className=""
                      onClick={() => {
                        submitAnswer();
                      }}
                    >
                      Submit Answer
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col w-[50%] justify-start max-h-[300px] overflow-y-scroll p-[20px]">
              {userCorrectAnswers.map((user) => {
                return (
                  <div
                    key={user.userInformation._id}
                    className="shadow-lg w-[90%] p-[20px] m-auto"
                  >
                    <div className="flex flex-row justify-between items-center w-full">
                      <div className="flex flex-col items-center justify-start ">
                        <h1> {user.userInformation.username}</h1>
                        <img
                          src={user.userInformation.image}
                          width={"80px"}
                          height={"80px"}
                          alt={"User Image"}
                        />
                      </div>
                      <div>
                        <p>
                          {user.correctAnswers}/{user.currentQuestionNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
        {userId && userId == host ? (
          <Button
            onClick={() => {
              endGame();
            }}
            className="w-[50%] m-auto block mt-[50px] rounded-xl"
            disabled={endGameLoading}
          >
            End Game
          </Button>
        ) : null}
      </Layout>
    </>
  );
};

export default Match;
