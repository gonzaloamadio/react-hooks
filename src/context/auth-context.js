import React, { useState } from "react";

// Le pasamos un valor de inicializacion a createContext
export const AuthContext = React.createContext({
  isAuth: false,
  login: () => {}
});

const AuthContextProvider = props => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loginHandler = () => {
    setIsAuthenticated(true);
  };

  return (
    // A context.Provider gives you automatically a component
    // value is distributed to all components that this one wraps, and tells them when it changes.
    // Or in other words, the components wrapped, listen to changes in this context provider.
    <AuthContext.Provider
      value={{ isAuth: isAuthenticated, login: loginHandler }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
