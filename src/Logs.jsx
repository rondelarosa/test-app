import React, { useState, useReducer, useEffect, useRef } from "react";
import useIsMountedRef from "./hooks/useIsMountedRef";

function greetingReducer(state, action) {
  switch (action.type) {
    case "SUCCESS": {
      return {
        error: null,
        greeting: action.greeting,
      };
    }
    case "ERROR": {
      return {
        error: action.error,
        greeting: null,
      };
    }
    default: {
      return state;
    }
  }
}

const initialState = { error: null, greeting: "hello there" };

export default function Filter({ url }) {
  const [{ error, greeting }, dispatch] = useReducer(
    greetingReducer,
    initialState
  );
  const [buttonClicked, setButtonClicked] = useState(false);

  let abortCont = useRef(null);
  let isMounted = useIsMountedRef();

  useEffect(() => {
    return () => {
      if (abortCont.current) abortCont.current.abort();
    };
  }, []);

  const fetchCall = async (url, signal) =>
    await fetch(
      url,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
      { signal }
    )
      .then(async (response) => {
        const { greeting } = await response.json();
        if (isMounted.current) {
          dispatch({ type: "SUCCESS", greeting });
          setButtonClicked(true);
        }
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        if (isMounted.current) {
          dispatch({ type: "ERROR", error });
        }
      });

  const fetchGreeting = async () => {
    // when it has previous request cancel
    if (abortCont.current) abortCont.current.abort();
    // create new fetch connection
    abortCont.current = new AbortController();

    // side effects (fetching from API)
    await fetchCall(url, abortCont.current.signal);
  };

  const buttonText = buttonClicked ? "Ok" : "Load Greeting";

  return (
    <div>
      <button onClick={fetchGreeting} disabled={buttonClicked}>
        {buttonText}
      </button>
      {greeting && <h1>{greeting}</h1>}
      {error && <p role="alert">Oops, failed to fetch!</p>}
    </div>
  );
}
