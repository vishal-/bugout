import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import {
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider
} from "@mui/material";
import Header from "./organisms/Header";
import { AppRoutes } from "./app.config";

const App = () => {
  return (
    <ThemeProvider
      theme={createTheme({
        palette: {
          mode: "dark"
        }
      })}
    >
      <HashRouter>
        <CssBaseline />

        <Container maxWidth="sm">
          <Header />

          <Routes>
            {Object.keys(AppRoutes).map((route) => (
              <Route
                key={`app_path_${route}`}
                path={AppRoutes[route].path}
                Component={AppRoutes[route].component}
              />
            ))}

            <Route
              path="/"
              element={<Navigate to={AppRoutes["Rapid Calculations"].path} />}
            />
          </Routes>
        </Container>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
