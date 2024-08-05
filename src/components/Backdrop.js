const Backdrop = (props) => {
  return (
    <div className="bg-black bg-opacity-60 absolute w-[100%] h-[100%] z-20">
      {props.children}
    </div>
  );
};

export default Backdrop;
