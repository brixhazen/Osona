import { createContext, useContext, useState, type ReactNode } from "react";
import { COMMUNITIES } from "@/lib/mock/dashboard";

type Community = typeof COMMUNITIES[number];

interface CommunityCtx {
  community: Community;
  setCommunity: (c: Community) => void;
}

const CommunityContext = createContext<CommunityCtx>({
  community: COMMUNITIES[0],
  setCommunity: () => {},
});

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [community, setCommunity] = useState<Community>(COMMUNITIES[0]);
  return (
    <CommunityContext.Provider value={{ community, setCommunity }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  return useContext(CommunityContext);
}
