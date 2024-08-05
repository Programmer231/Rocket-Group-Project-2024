import { Button } from "@/components/ui/button";
import Backdrop from "./Backdrop";
import { useRouter } from "next/router";

const Error = (props) => {
  const router = useRouter();
  return (
    <Backdrop>
      <div className="bg-white absolute top-1/2 left-1/2 p-[30px] text-center translate-x-[-50%] translate-y-[-50%] rounded-xl">
        <h1 className="font-bold text-2xl">Error: {props.message}</h1>
        <p className="text-xl mt-[20px]">{props.status}</p>
        <Button
          onClick={() => {
            router.push("/");
          }}
          className="mt-[50px]"
        >
          Exit
        </Button>
      </div>
    </Backdrop>
  );
};

export default Error;
