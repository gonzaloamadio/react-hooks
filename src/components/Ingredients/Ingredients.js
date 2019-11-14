import React, { useReducer, useCallback, useMemo } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";

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

const httpReducer = (currentHttpState, action) => {
  switch (action.type) {
    // We want to manage the state related with a http send request.
    // And it is, showing a spinner or an error
    case "SEND":
      return { isLoading: true, error: null };
    case "RESPONSE":
      return { ...currentHttpState, isLoading: false };
    case "ERROR":
      return {
        ...currentHttpState,
        isLoading: false,
        error: action.errorMessage
      };
    case "CLEAR":
      return { ...currentHttpState, error: null, isLoading: false };
    default:
      throw new Error("Should not arrive here.");
  }
};

const Ingredients = () => {
  // In this case we useReducer to manage multiple updates in one place, the reducer.
  const [ingredients, dispatch] = useReducer(ingredientReducer, []);
  // In this case we useReducer to manage multiple connected field.
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    isLoading: false,
    error: null
  });

  // const [ingredients, setIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

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
  const filterIngredientsHandler = useCallback(filteredIngredients => {
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = useCallback(ingr => {
    // setIsLoading(true);
    dispatchHttp({ type: "SEND" });
    fetch("https://react-hooks-23a01.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingr),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => {
        dispatchHttp({ type: "RESPONSE" });
        return response.json();
      })
      .then(responseData => {
        // setIngredients(prevIngredients => [
        //   ...prevIngredients,
        //   { id: responseData.name, ...ingr } // id is name because of Firebase
        // ]);
        dispatch({
          type: "ADD",
          ingredient: { id: responseData.name, ...ingr }
        });
      })
      .catch(error => {
        dispatchHttp({ type: "ERROR", errorMessage: error.message });
      });
  }, []);

  const removeIngredientHandler = useCallback(id => {
    dispatchHttp({ type: "SEND" });
    fetch(`https://react-hooks-23a01.firebaseio.com/ingredients/${id}.json`, {
      method: "DELETE"
    })
      .then(response => {
        dispatchHttp({ type: "RESPONSE" });
        // setIngredients(prevIngredients =>
        //   // prevIngredients.filter(function(value, index, arr) {
        //   prevIngredients.filter(function(ingredient) {
        //     return ingredient.id !== id;
        //   })
        // );
        dispatch({ type: "DELETE", id });
      })
      .catch(error => {
        dispatchHttp({ type: "ERROR", errorMessage: error.message });
      });
  }, []);

  const clearError = useCallback(() => {
    dispatchHttp({ type: "CLEAR" });
  }, []);

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
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}

      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.isLoading}
      />

      <section>
        <Search onLoadIngredients={filterIngredientsHandler} />
        {ingredientsList}
      </section>
    </div>
  );
};

export default Ingredients;
