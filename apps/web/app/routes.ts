import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  // dashboard - (main page)
  index("./dashboard/index.tsx"),

  // auth - (login page)
  route("login", "./auth/login.tsx"),

  // settings 
  route("settings", "./settings/index.tsx"),
] satisfies RouteConfig;