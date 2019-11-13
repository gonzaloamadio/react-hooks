import React, { useState, useEffect } from "react";

import Card from "../UI/Card";
import "./Search.css";

const Search = React.memo(props => {
  // As we use props inside useEffect, we need to do this so we can use onLoadIngredients
  // in the dependency array of useEffect. Because we want to use this specific props.
  // If we use props in the array, it will be all props.
  const { onLoadIngredients } = props;
  const [enteredFilter, setEnteredFilter] = useState("");

  // To search, we can register a function that is executed on each function stroke.
  // On the onChange, a handler that exec setEnteredFilter and also fetch from DB and search.
  // Or ... useEffect , and split the logic in a more elegant way.
  useEffect(() => {
    const query =
      enteredFilter.length === 0
        ? ""
        : `?orderBy="title"&equalTo="${enteredFilter}"`;
    fetch("https://react-hooks-23a01.firebaseio.com/ingredients.json" + query)
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
    // This will be exec, every time enteredFilter changes. i.e on every key stroke.
    // Or when onLoadIngredients changes. It is a function, it can change.. but it should not.
    // BUT.. if we use it like this, every time the component that is providing onLoadIngredients
    // is rendered, will create a new onLoadIngredients function, so this will be re executed,
    // and will cause an inifinite loop.
    // The solution is wrap onLoadIngredients with useCallback hook (in the component where it is
    // defined, i.e. Ingredients.js)
  }, [enteredFilter, onLoadIngredients]);

  return (
    <section className="search">
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          <input
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
