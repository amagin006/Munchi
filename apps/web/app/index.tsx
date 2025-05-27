import type { Route } from ".react-router/types/app/+types/root";
import { redirect } from "react-router";
import { getServerClient } from "~/util/supabase/supabaseClient";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const sbServerClient = await getServerClient(request);
    const userResponse = await sbServerClient.auth.getUser();

    if (userResponse?.data?.user) {
      return redirect("/dashboard");
    } else {
      console.log("--555555555");
      return redirect("/login");
    }
  } catch (error) {
    console.log("Error login: ", error);
    return redirect("/login");
  }
}
