import React, { useState, useReducer, useEffect, useRef } from "react";
import useIsMountedRef from "./hooks/useIsMountedRef";

function resultsReducer(state, action) {
  switch (action.type) {
    case "SUCCESS": {
      return {
        error: null,
        payload: action.data,
      };
    }
    case "ERROR": {
      return {
        error: action.error,
        payload: null,
      };
    }
    default: {
      return state;
    }
  }
}

const initialState = { error: null, payload: { results: [], totalResults: 0 } };

export default function Filter({ url }) {
  const [{ error, payload }, dispatch] = useReducer(
    resultsReducer,
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
        const data = await response.json();
        if (isMounted.current) {
          dispatch({ type: "SUCCESS", data });
          setButtonClicked(true);
        }
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        if (isMounted.current) {
          dispatch({ type: "ERROR", error });
        }
      });

  const fetchresults = async () => {
    // when it has previous request cancel
    if (abortCont.current) abortCont.current.abort();
    // create new fetch connection
    abortCont.current = new AbortController();

    // side effects (fetching from API)
    await fetchCall(url, abortCont.current.signal);
  };

  const buttonText = buttonClicked ? "Ok" : "Load logs";
  
  return (
    <div>
      <button onClick={fetchresults} disabled={buttonClicked}>
        {buttonText}
      </button>
      {payload && payload.results.map((m, i) => {
        return <h1 key={i.toString()} data-testid="log-id">{m.id}</h1>;
      })}
      {error && <p role="alert">Oops, failed to fetch!</p>}
    </div>
  );
}
