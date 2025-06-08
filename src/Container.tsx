import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import RapidCalculations from "./pages/RapidCalculation";

const AppRoutes = {
  RapidCalculation: "/rc"
};

const Container = () => {
  return (
    <div className="container-fluid">
      <HashRouter>
        <Routes>
          <Route
            path={AppRoutes.RapidCalculation}
            element={<RapidCalculations />}
          />
          <Route
            path="/"
            element={<Navigate to={AppRoutes.RapidCalculation} />}
          />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default Container;
