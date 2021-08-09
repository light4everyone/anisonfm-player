import React, { useState, useEffect, useMemo } from "react";

export const Counter = ({ duration }: { duration: number }) => {
  const [count, setCount] = useState(duration);

  const { minutes, seconds } = useMemo(() => {
    const seconds = +(count % 60);
    const minutes = (count - seconds) / 60;

    return { minutes, seconds };
  }, [count]);

  useEffect(() => {
    setCount(duration);
  }, [duration]);

  useEffect(() => {
    if (count <= 0) {
      return;
    }

    const id = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => {
      clearTimeout(id);
    };
  }, [count]);
  return (
    <span className="counter">
      {count > 0 ? (<>
        {minutes} : {seconds / 10 >= 1 ? seconds : <>0{seconds}</>}
      </>) : null}
    </span>
  );
}
