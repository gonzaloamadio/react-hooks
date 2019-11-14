import React, { useContext } from "react";

import Ingredients from "./components/Ingredients/Ingredients";
import { AuthContext } from "./context/auth-context";
import Auth from "./components/Auth";

const App = props => {
  // Pass the context you want to listen
  // You get a handler to that context
  // App will re-build whenever a context changes
  const authContext = useContext(AuthContext);

  let content = <Auth />;
  if (authContext.isAuth) {
    content = <Ingredients />;
  }
  return content;
};

export default App;
