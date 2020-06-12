import Profile from "views/pages/Profile.js";
import Register from "views/pages/Register.js";
import Login from "views/pages/Login.js";
import Sheets from "views/pages/Sheets";

var routes = [
  {
    path: "/sheets",
    name: "Planilhas",
    icon: "ni ni-archive-2 text-primary",
    component: Sheets,
    layout: "/admin"
  },
  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: Login,
    layout: "/auth"
  },
  {
    path: "/register",
    name: "Register",
    icon: "ni ni-circle-08 text-pink",
    component: Register,
    layout: "/auth"
  }
];
export default routes;
