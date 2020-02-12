import { createContext, useContext } from 'react';

export interface ILocation {
  state?: {
    fromPaginator?: boolean;
  };
}

export const LocationContext = createContext<ILocation | null>(null);

export const useLocation = () => {
  return useContext(LocationContext);
};
