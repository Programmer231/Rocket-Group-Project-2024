import Layout from "@/components/Layout";

export default function Home() {
  return (
    <main className="h-[100vh] w-full">
      <Layout>
        <div className="w-[90%] m-auto  mt-[100px]">
          <h1 className="text-center text-5xl font-bold">
            Welcome to Our Trivia Project
          </h1>
          <div className="flex flex-row w-full">
            <div className="flex flex-col w-full mt-[200px] justify-start items-center">
              <img
                src="Mya_Brown.jpeg"
                alt="Mya Brown Image"
                width="200px"
                height="800px"
              />
              <h1 className="w-full m-auto text-center">Mya Brown</h1>
            </div>
            <div className="flex flex-col w-full mt-[200px] justify-start items-center">
              <img
                src="SebastianNewberry.jpeg"
                alt="Sebastian Newberry Image"
                width="200px"
                height="800px"
              />
              <h1 className="w-full m-auto text-center">Sebastian Newberry</h1>
            </div>
            <div className="flex flex-col w-full mt-[200px] justify-start items-center">
              <img
                src="Jeremiah_Mack.jpg"
                alt="Jeremiah Mack Image"
                width="200px"
                height="800px"
              />
              <h1 className="w-full m-auto text-center">Jeremiah Mack</h1>
            </div>
            <div className="flex flex-col w-full mt-[200px] justify-start items-center">
              <img
                src="Bryce_Massie.jpeg"
                alt="Bryce Massie Image"
                width="200px"
                height="800px"
              />
              <h1 className="w-full m-auto text-center">Bryce Massie</h1>
            </div>
          </div>
        </div>
      </Layout>
    </main>
  );
}
