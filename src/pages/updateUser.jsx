import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

const UpdateUser = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const setUsernameHandler = (value) => {
    setUsername(value);
  };

  const setImageUrlHandler = (value) => {
    setImageUrl(value);
  };

  const registerHandler = async (event) => {
    event.preventDefault();

    const userCredentials = {
      username: username,
      imageUrl: imageUrl,
    };

    try {
      const resData = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + "/trivia/user/updateUser",
        {
          method: "POST",
          body: JSON.stringify(userCredentials),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const res = await resData.json();

      if (res.success) {
        router.replace("/");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const isAuthenticated = async () => {
    const res = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL + "/trivia/user/getUser",
      { credentials: "include", method: "GET" }
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
        onSubmit={(event) => registerHandler(event)}
      >
        <div className="w-full">
          <Label>Name</Label>
          <Input
            className="w-full"
            onChange={(event) => {
              setUsernameHandler(event.target.value);
            }}
            value={username}
          />
        </div>

        <div className="w-full">
          <Label>ImageUrl</Label>
          <Input
            className="w-full"
            onChange={(event) => {
              setImageUrlHandler(event.target.value);
            }}
            value={imageUrl}
          />
        </div>

        <Button
          className="w-1/2 m-auto bg-primary text-primary-foreground"
          type="submit"
        >
          Update User
        </Button>
      </form>
    </Layout>
  );
};

export default UpdateUser;
