import React, { useCallback, useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { io } from "socket.io-client";
import he from "he";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ErrorComponent from "@/components/Error";

const Match = (props) => {
  const [socket, setSocket] = useState();

  const [question, setQuestion] = useState();
  const [answers, setAnswers] = useState([]);
  const [userCorrectAnswers, setUserCorrectAnswers] = useState([]);
  const [doneAnswering, setDoneAnswering] = useState(false);
  const [host, setHost] = useState("");
  const [userId, setUserId] = useState();
  const [matchQuestions, setMatchQuestions] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [error, setError] = useState();

  const [selectedAnswer, setSelectedAnswer] = useState(-1);

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
    socket.emit("endMatch", router.query.roomId, router.query.matchId);
  };

  const getMatch = async () => {
    if (router.isReady) {
      const res = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL +
          `/trivia/rooms/getMatch/?matchId=${router.query.matchId}`,
        { credentials: "include", method: "GET" }
      );

      console.log(res.ok);

      if (!res.ok) {
        const error = await res.json();

        setError({ message: error.message, status: res.status });
      } else {
        const match = await res.json();

        if (!match.match) {
          setError({ message: "Couldn't find match", status: 404 });
        } else {
          setMatchQuestions(match.match.numberOfQuestions);
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

        for (let user of users) {
          if (user.userInformation._id == userId) {
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

        question = question.question;

        const cleanedAnswers = [];

        for (let answer of [
          ...question.incorrect_answers,
          question.correct_answer,
        ]) {
          cleanedAnswers.push(he.decode(answer));
        }

        setQuestion(he.decode(question.question));
        setAnswers([...cleanedAnswers]);
      } catch (err) {
        console.log(err);
        if (err.status == 409) {
          if (router.isReady) {
            const res = await fetch(
              process.env.NEXT_PUBLIC_SERVER_URL +
                `/trivia/rooms/getMatch/?matchId=${router.query.matchId}`,
              { credentials: "include", method: "GET" }
            );

            const match = await res.json();
            console.log(match);
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

      if (user.user) {
        setUserId(user.user._id);
      }
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

        console.log(users);

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

    getUser();

    getMatch();

    getHost();

    setSocket(socket);

    socket.emit("joinMatch", router.query.matchId);

    socket.on("nextQuestion", (question) => {
      if (!question) {
        return;
      }
      const cleanedAnswers = [];

      for (let answer of [
        ...question.incorrect_answers,
        question.correct_answer,
      ]) {
        cleanedAnswers.push(he.decode(answer));
      }

      setQuestion(he.decode(question.question));
      setSelectedAnswer(-1);
      setAnswers([...cleanedAnswers]);
    });

    socket.on("send-go-to-lobby", () => {
      router.replace("/game/join");
    });

    socket.on("questionResult", (userId, answerStatus) => {
      setUserCorrectAnswers((prevState) => {
        let indexOfUserUpdate = prevState.findIndex((user) => {
          return user.userInformation._id == userId;
        });

        let newUsers = [...prevState];

        if (answerStatus) {
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
        <div>
          <h1>
            {currentQuestion}/{matchQuestions}
          </h1>
        </div>
        {currentQuestion >= matchQuestions ? (
          <h1>Waiting for the Host to end the game to record results...</h1>
        ) : (
          <>
            <div className="shadow-lg p-[50px] w-1/2 flex flex-col gap-[100px] m-auto mt-[100px]">
              <h1 className="text-center font-bold">{question}</h1>
              <div className="flex flex-col justify-center gap-[50px]">
                {answers.map((answer, idx) => {
                  return (
                    <div
                      key={idx}
                      className={`${
                        selectedAnswer == idx
                          ? "flex flex-row w-1/2 border-2 border-blue justify-between m-auto cursor-pointer p-[10px] rounded-xl"
                          : "flex flex-row w-1/2 justify-between m-auto cursor-pointer p-[10px] rounded-xl"
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
            </div>
            <div className="w-1/2 flex justify-center m-auto mt-[50px]">
              <Button
                className=""
                onClick={() => {
                  submitAnswer();
                }}
              >
                Submit Answer
              </Button>
            </div>
          </>
        )}

        <div>
          {userCorrectAnswers.map((user) => {
            return (
              <div key={user.userInformation._id}>
                <p> {user.userInformation.username}</p>
                <p>
                  {user.correctAnswers}/{user.currentQuestionNumber}
                </p>
              </div>
            );
          })}
        </div>
        <Button
          onClick={() => {
            endGame();
          }}
        >
          End Game
        </Button>
      </Layout>
    </>
  );
};

export default Match;
