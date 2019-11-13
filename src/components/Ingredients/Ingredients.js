import React, { useState } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import Search from "./Search";

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);

  const addIngredientHandler = ingr => {
    fetch("https://react-hooks-23a01.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingr),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => {
        return response.json();
      })
      .then(responseData => {
        setIngredients(prevIngredients => [
          ...prevIngredients,
          { id: responseData.name, ...ingr } // id is name because of Firebase
        ]);
      });
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
