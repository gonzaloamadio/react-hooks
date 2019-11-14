import React, { useState, useCallback } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  // We do not need this on first renderd. Search will do it.
  // If we leave it, we will have to http requests on component startup.
  //
  // useEffect(() => {
  //   fetch("https://react-hooks-23a01.firebaseio.com/ingredients.json")
  //      ...
  //       setIngredients(loadedIngredients);
  //     });
  // }, []);

  // If we do not use useCallback, every time this component renders, will cause
  // a new reference of filterIngredientsHandler passed on to Search component.
  // This function is on a dependency array of useEffect on Search component,
  // and will cause a search of ingredients, and re render this one. So an infinite loop
  // With useCallback, this function is cached, preventing this.
  const filterIngredientsHandler = useCallback(filterIngredients => {
    setIngredients(filterIngredients);
  }, []);

  const addIngredientHandler = ingr => {
    setIsLoading(true);
    fetch("https://react-hooks-23a01.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingr),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => {
        setIsLoading(false);
        return response.json();
      })
      .then(responseData => {
        setIngredients(prevIngredients => [
          ...prevIngredients,
          { id: responseData.name, ...ingr } // id is name because of Firebase
        ]);
      })
      .catch(error => {
        setError(error.message);
      });
  };

  const removeIngredientHandler = id => {
    setIsLoading(true);
    fetch(`https://react-hooks-23a01.firebaseio.com/ingredients/${id}.json`, {
      method: "DELETE"
    })
      .then(response => {
        setIsLoading(false);
        setIngredients(prevIngredients =>
          // prevIngredients.filter(function(value, index, arr) {
          prevIngredients.filter(function(ingredient) {
            return ingredient.id !== id;
          })
        );
      })
      .catch(error => {
        setError(error.message);
      });
  };

  const clearError = () => {
    setIsLoading(false);
    setError(null);
  };

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}

      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filterIngredientsHandler} />
        <IngredientList
          ingredients={ingredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
