import Head from "next/head";

const Header = (props) => {
  return (
    <Head>
      <title>{props.title}</title>
    </Head>
  );
};

export default Header;
