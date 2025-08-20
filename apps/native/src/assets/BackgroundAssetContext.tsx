import React, { createContext, useContext } from "react";

export const BackgroundAssetContext = createContext<string | undefined>(undefined);

export const useBackgroundAsset = () => {
  const context = useContext(BackgroundAssetContext);
  if (context === undefined) {
    throw new Error("useBackgroundAsset must be used within a BackgroundAssetProvider");
  }
  return context;
}; 