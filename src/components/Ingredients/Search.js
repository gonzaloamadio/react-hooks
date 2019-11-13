import React, { useState, useEffect, useRef } from "react";

import Card from "../UI/Card";
import "./Search.css";

const Search = React.memo(props => {
  // As we use props inside useEffect, we need to do this so we can use onLoadIngredients
  // in the dependency array of useEffect. Because we want to use this specific props.
  // If we use props in the array, it will be all props.
  const { onLoadIngredients } = props;
  const [enteredFilter, setEnteredFilter] = useState("");
  const inputRef = useRef();

  // To search, we can register a function that is executed on each function stroke.
  // On the onChange, a handler that exec setEnteredFilter and also fetch from DB and search.
  // Or ... useEffect , and split the logic in a more elegant way.
  useEffect(() => {
    // We want to look for values if the user has stopped writing, not for every key stroke.
    // So with timeOut, if you stop writing for 1 second, we assume you stop searching
    setTimeout(() => {
      // enteredFilter will be locked in when we setTimeout, so it will not be the current one
      // it will be the "old" one.
      // To get the current value, we use a reference.
      if (enteredFilter === inputRef.current.value) {
        const query =
          enteredFilter.length === 0
            ? ""
            : `?orderBy="title"&equalTo="${enteredFilter}"`;
        fetch(
          "https://react-hooks-23a01.firebaseio.com/ingredients.json" + query
        )
          .then(response => response.json())
          .then(responseData => {
            const loadedIngredients = [];
            for (const key in responseData) {
              loadedIngredients.push({
                id: key,
                title: responseData[key].title,
                amount: responseData[key].amount
              });
            }
            // After we search, we should pass this info to Ingredients.js, where we show the ingredients.
            onLoadIngredients(loadedIngredients);
          });
      }
    }, 1000);

    // This will be exec, every time enteredFilter changes.
    // Or when onLoadIngredients changes. It is a function, it can change.. but it should not.
    // BUT.. if we use it like this, every time the component that is providing onLoadIngredients
    // is rendered, will create a new onLoadIngredients function, so this will be re executed,
    // and will cause an inifinite loop.
    // The solution is wrap onLoadIngredients with useCallback hook (in the component where it is
    // defined, i.e. Ingredients.js)
  }, [enteredFilter, onLoadIngredients, inputRef]);

  return (
    <section className="search">
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
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
