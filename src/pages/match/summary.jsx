import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Error from "@/components/Error";
import he from "he";
import { Bar, BarChart, CartesianGrid, XAxis, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartTooltip,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";

const GameSummary = () => {
  const router = useRouter();

  const [error, setError] = useState();
  const [matchUsers, setMatchUsers] = useState([]);
  const [matchQuestions, setMatchQuestions] = useState([]);
  const [category, setCategory] = useState();
  const [difficulty, setDifficulty] = useState();

  const chartConfig = {
    number: {
      label: "Answers",
      color: "#2563eb",
    },
  };

  const getAllMatchUsers = async () => {
    try {
      if (router.isReady) {
        const res = await fetch(
          process.env.NEXT_PUBLIC_SERVER_URL +
            `/trivia/rooms/allMatchAnswers/?matchId=${router.query.matchId}`,
          {
            credentials: "include",
            method: "GET",
          }
        );

        const users = await res.json();

        console.log(users.userCorrectAnswers.answers);

        setMatchUsers(users.userCorrectAnswers);
      }
    } catch (err) {
      console.log(err);

      if (err.message && err.status) {
        setError({ message: err.message, status: err.status });
      } else {
        setError({
          message: "Unable to Find Answers for this match",
          status: 404,
        });
      }
    }

    try {
      if (router.isReady) {
        const res = await fetch(
          process.env.NEXT_PUBLIC_SERVER_URL +
            `/trivia/rooms/getMatch/?matchId=${router.query.matchId}`,
          {
            credentials: "include",
            method: "GET",
          }
        );

        const matchInfo = await res.json();

        setCategory(he.decode(matchInfo.match.category));
        setDifficulty(he.decode(matchInfo.match.difficulty));
        setMatchQuestions(matchInfo.match.questions);
      }
    } catch (err) {
      console.log(err);
      if (err.message && err.status) {
        setError({ message: err.message, status: err.status });
      } else {
        setError({
          message: "Unable to Find Match",
          status: 404,
        });
      }
    }
  };

  useEffect(() => {
    getAllMatchUsers();
  }, [router.query.matchId]);

  return (
    <Layout>
      {error ? (
        <Error message={error.message} status={error.status}></Error>
      ) : null}
      <div className="mt-[50px] text-center w-full">
        <h1 className="font-bold text-5xl">Game Summary</h1>
        <div className="mt-[100px] flex flex-row justify-between items-center w-[80%] m-auto">
          <div className="flex flex-row justify-between w-[50%] m-auto">
            <h1 className="font-medium text-xl flex-1">
              Category - {category}
            </h1>
            <h1 className="font-medium text-xl flex-1">
              {" "}
              Difficulty: {difficulty}
            </h1>
          </div>
        </div>
        <div className="mt-[100px]">
          <h1>Results: </h1>
          <div className="grid grid-cols-1 gap-x-24 gap-y-32 mt-[50px] w-[50%] m-auto border-black">
            {matchQuestions.map((question, idx) => {
              let chartData = [];

              let questionData = [
                ...question.incorrect_answers,
                question.correct_answer,
              ];

              for (let x = 0; x < questionData.length; x++) {
                let currentAnswer = questionData[x];

                chartData[x] = {
                  answer:
                    currentAnswer == question.correct_answer
                      ? he.decode(currentAnswer) + " CORRECT"
                      : he.decode(currentAnswer),
                  number: matchUsers.reduce((acc, curr) => {
                    // Make sure the user's answer exists and matches the current answer
                    if (
                      curr.answers[idx] !== undefined &&
                      he.decode(curr.answers[idx]) === he.decode(currentAnswer)
                    ) {
                      return acc + 1;
                    }
                    return acc;
                  }, 0),
                  isCorrect: currentAnswer == question.correct_answer,
                };
              }

              const getBarColor = (entry) => {
                return entry.isCorrect ? "green" : "red";
              };

              return (
                <div className="flex flex-col" key={question._id}>
                  <h1 className="font-medium">
                    {he.decode(question.question)}
                  </h1>
                  <ChartContainer
                    config={chartConfig}
                    className="min-h-[100px] w-full"
                  >
                    <BarChart
                      accessibilityLayer
                      data={chartData}
                      width={10}
                      height={10}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="answer"
                        tickLine={false}
                        tickMargin={20}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="number" radius={4}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getBarColor(entry)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                  <div className="flex flex-row justify-start mt-[20px]">
                    {questionData.map((specificAnswer) => {
                      let matchUsersWithAnswer = [];

                      for (let user of matchUsers) {
                        if (!user.answers[idx]) {
                          continue;
                        }
                        if (
                          he.decode(user.answers[idx]) ==
                          he.decode(specificAnswer)
                        ) {
                          matchUsersWithAnswer.push(user);
                        }
                      }

                      return (
                        <div
                          className={`flex-col ${
                            questionData.length == 2
                              ? "min-w-[50%]"
                              : "min-w-[25%]"
                          } gap-[50px]`}
                          key={specificAnswer}
                        >
                          {matchUsersWithAnswer.map((user) => (
                            <div
                              className="flex-col gap-[20px] items-center justify-start w-full"
                              key={user.userInformation._id}
                            >
                              <img
                                src={user.userInformation.image}
                                alt={`User ${user.userInformation.username} Image`}
                                width="80px"
                                height={"80px"}
                                className="block m-auto"
                              />
                              <h1>{user.userInformation.username}</h1>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <Button
            onClick={() => {
              router.push("/");
            }}
            className="mt-[100px] rounded-xl"
          >
            Exit Summary
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default GameSummary;
