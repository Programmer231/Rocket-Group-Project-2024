import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  ListItem,
} from "@/components/ui/navigation-menu";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function NavigationMenuDemo() {
  const router = useRouter();

  const [user, setUser] = useState();

  const logout = async () => {
    try {
      await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/trivia/user/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const getUser = async () => {
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + "/trivia/user/getUser",
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const user = await res.json();

      setUser(user.user);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div className="relative flex flex-row justify-between w-full py-9 px-32 shadow-xl bg-primary items-center">
      <h1 className="text-5xl cursor-pointer" onClick={() => router.push("/")}>
        Trivia Battle
      </h1>
      {user ? (
        <div className="flex flex-col justify-center items-center">
          <img
            src={user.image}
            alt="User Image"
            width="100px"
            height={"100px"}
            className="rounded-lg"
          />
          <h1 className="font-medium">{user.username}</h1>
        </div>
      ) : null}
      <NavigationMenu>
        <NavigationMenuList>
          {user ? (
            <>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Play</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-full grid grid-rows-2 gap-3 p-6 md:w-[283px]">
                    <ListItem href="/game/create" title="Create">
                      Create a game room where you and your friends can battle
                      against each other in trivia knowledge
                    </ListItem>
                    <ListItem href="/game/join" title="Join">
                      Join a game room to play.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>User</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-full grid grid-rows-2 gap-3 p-6 md:w-[283px]">
                    <ListItem href="/updateUser" title="Update User">
                      Update your user information to change your picture or
                      username
                    </ListItem>
                    <ListItem href="/leaderboards" title="View Leaderboards">
                      See which players stand out in the trivia leaderboards.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </>
          ) : null}
          {!user ? (
            <NavigationMenuItem>
              <NavigationMenuTrigger>Login/Register</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="w-full grid gap-3 p-4 grid-rows-2 md:w-[283px]">
                  <ListItem href="/login" title="Login">
                    Login to keep track of your glorious victories against other
                    trivia experts
                  </ListItem>
                  <ListItem href="/register" title="Register">
                    Register to play
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem>
              <Button variant="outline" className="text-md" onClick={logout}>
                Logout
              </Button>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

export default NavigationMenuDemo;
