import { useReducer, useCallback } from "react";

const initialState = {
  isLoading: false,
  error: null,
  data: null,
  extra: null,
  identifier: null
};

const httpReducer = (currentHttpState, action) => {
  switch (action.type) {
    // We want to manage the state related with a http send request.
    // And it is, showing a spinner or an error
    case "SEND":
      return {
        isLoading: true,
        error: null,
        extra: null,
        identifier: action.identifier
      };
    case "RESPONSE":
      return {
        ...currentHttpState,
        isLoading: false,
        data: action.responseData,
        extra: action.extra
      };
    case "ERROR":
      return {
        ...currentHttpState,
        isLoading: false,
        error: action.errorMessage
      };
    case "CLEAR":
      return initialState;
    default:
      throw new Error("Should not arrive here.");
  }
};

// Inside hooks we can run stateful logic, like use other hooks.
// The component that executes this hook, will run it as if the code was written inside the component.
// Each component will have it own snapshot. So they will share logic and not data. That is the idea of hooks.
// Hook will re-run with every re-render cycle. You can use technics to decide what you want to happen with the state
// but this is other story.
const useHttp = () => {
  const [httpState, dispatchHttp] = useReducer(httpReducer, initialState);

  const clear = useCallback(() => dispatchHttp({ type: "CLEAR" }), []);

  const sendRequest = useCallback((url, method, body, extra, reqId) => {
    dispatchHttp({ type: "SEND", identifier: reqId });
    fetch(url, {
      method: method,
      body: body,
      headers: { "Content-Type": "application/json" }
    })
      // We can just return sendRequest here, and use .then and .catch in the component
      // where we use this hook.
      // Or use it like this, and manage the handling of the response in the component
      // where we use this hook with useEffect, to detect when data is changed and do some thing.
      // With this method, we clearly split responsabilities. Here we make calls and in the other
      // component we handle responses.
      .then(response => {
        return response.json();
      })
      .then(responseData => {
        // How do we pass data (response) to the component
        // We can add a new variable to the hook, another field in the useReducer,
        // so we store it in the state of this hook and we can extract it in the component that uses this hook.
        dispatchHttp({ type: "RESPONSE", responseData, extra });
      })
      .catch(error => {
        dispatchHttp({ type: "ERROR", errorMessage: error.message });
      });
  }, []);

  // We can return something, an array, an object, etc.
  return {
    isLoading: httpState.isLoading,
    error: httpState.error,
    data: httpState.data,
    sendRequest,
    extra: httpState.extra,
    reqIdentifier: httpState.identifier,
    clear
  };
};

export default useHttp;
