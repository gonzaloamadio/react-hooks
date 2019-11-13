import React, { useState } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import Search from "./Search";

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);

  const addIngredientHandler = ingr => {
    // setIngredients(prevIngredients => [...prevIngredients, ingr])
    // For now, create dummy id, then will be brought from server.
    setIngredients(prevIngredients => [
      ...prevIngredients,
      { id: Math.random().toString(), ...ingr }
    ]);
  };

  const removeIngredientHandler = id => {
    setIngredients(prevIngredients =>
      // prevIngredients.filter(function(value, index, arr) {
      prevIngredients.filter(function(ingredient) {
        return ingredient.id !== id;
      })
    );
  };

  return (
    <div className="App">
      <IngredientForm onAddIngredient={addIngredientHandler} />

      <section>
        <Search />
        <IngredientList
          ingredients={ingredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
