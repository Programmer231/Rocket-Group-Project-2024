import Head from "next/head";

const header = (props) => {
  return (
    <Head>
      <title>{props.title}</title>
    </Head>
  );
};

export default header;
