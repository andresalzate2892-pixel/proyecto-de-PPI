import { createContext, useContext, useState } from "react";

const SpaceContext = createContext();

export function SpaceProvider({ children }) {
  const [space, setSpaceState] = useState(() => {
    return (
      localStorage.getItem("espacioActivo") ||
      "Personal"
    );
  });

  const setSpace = (newSpace) => {
    setSpaceState(newSpace);

    localStorage.setItem(
      "espacioActivo",
      newSpace
    );
  };

  return (
    <SpaceContext.Provider
      value={{
        space,
        setSpace
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
}

export function useSpace() {
  return useContext(SpaceContext);
}