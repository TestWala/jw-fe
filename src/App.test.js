import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

test("renders Dashboard route", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  const dashboardElement = screen.getByText(/Dashboard/i);
  expect(dashboardElement).toBeInTheDocument();
});
