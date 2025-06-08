import React from "react";
import RapidCalculations from "./pages/RapidCalculation";
import Home from "./pages/Home";

type AppRoutesType = {
  [route: string]: {
    path: string;
    component: React.ComponentType;
  };
};

export const AppRoutes: AppRoutesType = {
  Home: { path: "/home", component: Home },
  "Rapid Calculations": { path: "/rc", component: RapidCalculations }
};
