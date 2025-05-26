import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  // routing page to determine wether navigate main or login
  index('./index.tsx'),
  // dashboard - (main page)
  route('dashboard', "./dashboard/index.tsx"),
  // auth - (login page)
  route("login", "./auth/login.tsx"),
  // settings 
  route("settings", "./settings/index.tsx"),
] satisfies RouteConfig;