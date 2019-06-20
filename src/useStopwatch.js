import { useState, useRef, useCallback, useEffect } from "react";
import moment from "moment";
import throttle from "lodash/throttle";

export function calculateTimeDiff(startTime, pauseOffset) {
  let timeDiff = moment.duration(moment().diff(startTime));
  if (pauseOffset) timeDiff = timeDiff.add(pauseOffset);

  return timeDiff;
}

const defaultState = {
  startTime: null,
  hours: 0,
  minutes: 0,
  seconds: 0,
  milliseconds: 0,
  pauseOffset: 0,
};
export function useStopwatch(initialState = defaultState, throttling = 70) {
  // State
  const [time, setTime] = useState(initialState);
  const intervalHandle = useRef({ timer: null });

  // Initialize
  useEffect(() => {
    return () => clearInterval(intervalHandle.current.timer);
  }, []);

  // Timer start
  const startHandler = useCallback(() => {
    if (!intervalHandle.current.timer) {
      const startTime = moment();
      const updateTimer = () => {
        const timeDiff = calculateTimeDiff(startTime, time.pauseOffset);
        setTime({
          ...time,
          startTime,
          hours: timeDiff.hours(),
          minutes: timeDiff.minutes(),
          seconds: timeDiff.seconds(),
          milliseconds: timeDiff.milliseconds()
        });
      };
      intervalHandle.current.timer = setInterval(throttle(updateTimer, throttling), 10);
    }
  }, [time.pauseOffset]);

  // Timer pause
  const pauseHandler = useCallback(() => {
    if (intervalHandle.current.timer) {
      clearInterval(intervalHandle.current.timer);
      intervalHandle.current.timer = null;
      const durationToPauseClick = moment.duration(
        moment().diff(time.startTime)
      );
      durationToPauseClick.add(time.pauseOffset);
      setTime({
        ...time,
        pauseOffset: durationToPauseClick
      });
    }
  }, [time]);

  // Timer reset
  const resetHandler = useCallback(() => {
    clearInterval(intervalHandle.current.timer);
    intervalHandle.current.timer = null;
    setTime(initialState);
  }, [initialState]);

  return {
    startHandler,
    resetHandler,
    pauseHandler,
    intervalHandle,
    time,
    setTime
  };
}
