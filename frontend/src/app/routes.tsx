import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout";
import { Dashboard } from "./pages/dashboard";
import { AddTransaction } from "./pages/add-transaction";
import { Transactions } from "./pages/transactions";
import { Categories } from "./pages/categories";
import { Profile } from "./pages/profile";
import { Login } from "./pages/login";
import { Signup } from "./pages/signup";
import { AuthLayout } from "./components/auth-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
    ],
  },
  {
    path: "/app",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "add",
        element: <AddTransaction />,
      },
      {
        path: "transactions",
        element: <Transactions />,
      },
      {
        path: "categories",
        element: <Categories />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
]);
