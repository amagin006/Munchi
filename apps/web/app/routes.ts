import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  // routing page to determine wether navigate main or login
  index('./index.tsx'),
  // auth - (login page)
  route("login", "./routes/auth/Login.tsx"),
  route("register", "./routes/auth/Register.tsx"),
  // dashboard - (main page)
  route('dashboard', "./routes/dashboard/index.tsx"),
  route("addPet", "./routes/addPet/AddPet.tsx"),
  // settings 
  route("settings", "./routes/settings/index.tsx"),
] satisfies RouteConfig;