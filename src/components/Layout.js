import Navbar from "@/components/Navbar";
import Head from "@/components/Head";
import { Toaster } from "@/components/ui/sonner";

const Layout = (props) => {
  return (
    <>
      <Head title={"Trivia Game"} />
      <div className="w-full h-screen bg-white text-primary-foreground text-xl">
        <Navbar />
        {props.children}
        <Toaster />
      </div>
    </>
  );
};

export default Layout;
