import React, { useReducer, useCallback, useMemo, useEffect } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";
import useHttp from "../../hooks/http";

// currentIngredients is the "old" state
const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error("Should not arrive here.");
  }
};

const Ingredients = () => {
  // In this case we useReducer to manage multiple updates in one place, the reducer.
  const [ingredients, dispatch] = useReducer(ingredientReducer, []);
  const {
    isLoading,
    error,
    data,
    sendRequest,
    extra,
    reqIdentifier,
    clear
  } = useHttp();

  // Remember that this is exec after the render. So we have to be sure that the
  // data we use, is not null. For example checking that it is not in loading state.
  useEffect(() => {
    if (!isLoading && !error && reqIdentifier === "REMOVE_INGREDIENT") {
      dispatch({ type: "DELETE", id: extra });
    } else if (!isLoading && !error && reqIdentifier === "ADD_INGREDIENT") {
      dispatch({ type: "ADD", ingredient: { id: data.name, ...extra } });
    }
  }, [data, error, extra, isLoading, reqIdentifier]);

  // If we do not use useCallback, every time this component renders, will cause
  // a new reference of filterIngredientsHandler passed on to Search component.
  // This function is on a dependency array of useEffect on Search component,
  // and will cause a search of ingredients, and re render this one. So an infinite loop
  // With useCallback, this function is cached, preventing this.
  const filterIngredientsHandler = useCallback(filteredIngredients => {
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = useCallback(
    ingr => {
      sendRequest(
        `https://react-hooks-23a01.firebaseio.com/ingredients/.json`,
        "POST",
        JSON.stringify(ingr),
        ingr,
        "ADD_INGREDIENT"
      );
    },
    [sendRequest]
  );

  const removeIngredientHandler = useCallback(
    id => {
      sendRequest(
        `https://react-hooks-23a01.firebaseio.com/ingredients/${id}.json`,
        "DELETE",
        null,
        id,
        "REMOVE_INGREDIENT"
      );
      // Now sendRequest is an external dependency, we have to add it here.
      // Should have useCallback to, so the optimization is valid
    },
    [sendRequest]
  );

  const clearError = useCallback(() => {
    // we can pass clear to onClose directly
    clear();
  }, [clear]);

  const ingredientsList = useMemo(() => {
    return (
      <IngredientList
        ingredients={ingredients}
        onRemoveItem={removeIngredientHandler}
      />
    );
    // removeIngredientHandler should not change because we wrapped it with useCallback
  }, [ingredients, removeIngredientHandler]);

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}

      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filterIngredientsHandler} />
        {ingredientsList}
      </section>
    </div>
  );
};

export default Ingredients;
