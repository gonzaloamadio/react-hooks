import React, { useState, useEffect, useRef } from "react";

import Card from "../UI/Card";
import ErrorModal from "../UI/ErrorModal";
import useHttp from "../../hooks/http";

import "./Search.css";

const Search = React.memo(props => {
  // As we use props inside useEffect, we need to do this so we can use onLoadIngredients
  // in the dependency array of useEffect. Because we want to use this specific props.
  // If we use props in the array, it will be all props.
  const { onLoadIngredients } = props;
  const [enteredFilter, setEnteredFilter] = useState("");
  const inputRef = useRef();
  const { isLoading, error, data, sendRequest, clear } = useHttp();

  // To search, we can register a function that is executed on each function stroke.
  // On the onChange, a handler that exec setEnteredFilter and also fetch from DB and search.
  // Or ... useEffect , and split the logic in a more elegant way.
  useEffect(() => {
    // We want to look for values if the user has stopped writing, not for every key stroke.
    // So with timeOut, if you stop writing for 1 second, we assume you stop searching
    const timer = setTimeout(() => {
      // enteredFilter will be locked in when we setTimeout, so it will not be the current one
      // it will be the "old" one.
      // To get the current value, we use a reference.
      if (enteredFilter === inputRef.current.value) {
        const query =
          enteredFilter.length === 0
            ? ""
            : `?orderBy="title"&equalTo="${enteredFilter}"`;
        const url =
          "https://react-hooks-23a01.firebaseio.com/ingredients.json" + query;

        sendRequest(url, "GET");
      }
    }, 1000);

    // useEffect cleanup function
    return () => {
      clearTimeout(timer);
    };
  }, [enteredFilter, inputRef, sendRequest]);

  useEffect(() => {
    if (!isLoading && !error && data) {
      const loadedIngredients = [];
      for (const key in data) {
        loadedIngredients.push({
          id: key,
          title: data[key].title,
          amount: data[key].amount
        });
      }
      // After we search, we should pass this info to Ingredients.js, where we show the ingredients.
      onLoadIngredients(loadedIngredients);
    }
    // This will be exec, every time enteredFilter changes.
    // Or when onLoadIngredients changes. It is a function, it can change.. but it should not.
    // BUT.. if we use it like this, every time the component that is providing onLoadIngredients
    // is rendered, will create a new onLoadIngredients function, so this will be re executed,
    // and will cause an inifinite loop.
    // The solution is wrap onLoadIngredients with useCallback hook (in the component where it is
    // defined, i.e. Ingredients.js)
  }, [data, error, isLoading, onLoadIngredients]);

  return (
    <section className="search">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          {isLoading && <span>Loading...</span>}
          <input
            ref={inputRef}
            type="text"
            value={enteredFilter}
            onChange={event => setEnteredFilter(event.target.value)}
          />
        </div>
      </Card>
    </section>
  );
});

export default Search;
