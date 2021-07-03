import React, { useEffect, useState } from "react";

const Expire = ({ delay = 7000, children }) => {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  const [timer1, setTimer1] = useState(undefined);
  const [timer2, setTimer2] = useState(undefined);

  useEffect(() => {
    setTimer1(
      setTimeout(() => {
        setFadingOut(true);
      }, delay)
    );
    setTimer2(
      setTimeout(() => {
        setVisible(false);
      }, delay + 1000)
    );
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);

  if (visible && !fadingOut) {
    return (
      <div
        onMouseOver={() => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        }}
        onMouseLeave={() => {
          setTimer1(
            setTimeout(() => {
              setFadingOut(true);
            }, delay)
          );
          setTimer2(
            setTimeout(() => {
              setVisible(false);
            }, delay + 1000)
          );
        }}
        className="animate-fade-in"
      >
        {children}
      </div>
    );
  } else if (visible && fadingOut) {
    return (
      <div
        onMouseOver={() => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          setFadingOut(false);
        }}
        onMouseLeave={() => {
          setTimer1(
            setTimeout(() => {
              setFadingOut(true);
            }, delay)
          );
          setTimer2(
            setTimeout(() => {
              setVisible(false);
            }, delay + 1000)
          );
        }}
        className="transition-opacity opacity-0 duration-1000 ease-in-out"
      >
        {children}
      </div>
    );
  } else {
    return <div />;
  }
};

export default Expire;
