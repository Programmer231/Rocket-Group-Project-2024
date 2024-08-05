import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

const Login = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");

  const setUsernameHandler = (value) => {
    setUsername(value);
  };

  const loginHandler = async (event) => {
    event.preventDefault();

    const userCredentials = { username: username };

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + "/trivia/user/login",
        {
          method: "POST",
          body: JSON.stringify(userCredentials),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const success = await res.json();

      if (success["success"]) {
        router.replace("/");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Layout>
      <form
        className="w-1/2 bg-white flex flex-col text-black m-auto p-9 mt-20 gap-10 rounded-xl shadow-lg"
        onSubmit={(event) => loginHandler(event)}
      >
        <div className="w-full">
          <Label>Name</Label>
          <Input
            className="w-full"
            onChange={(event) => setUsernameHandler(event.target.value)}
            value={username}
          />
        </div>

        <Button
          className="w-1/2 m-auto bg-primary text-primary-foreground"
          variant="outline"
          type="submit"
        >
          Login
        </Button>
      </form>
    </Layout>
  );
};

export default Login;
