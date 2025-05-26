// app/auth/login.tsx
import { Form, Link, useNavigate, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { redirect } from "react-router";
import { useState } from "react";
import {
  getBrowserClient,
  getServerClient,
  signIn,
} from "../util/supabase/supabaseClient";

export async function loader({ request }: Route.LoaderArgs) {
  const sbServerClient = await getServerClient(request);
  const userResponse = await sbServerClient.auth.getUser();

  if (userResponse?.data?.user) {
    throw redirect("/dashboard");
  }

  return {
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL!,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    },
  };
}

// フォーム送信時のアクション
export async function action({ request }: Route.ActionArgs) {
  console.log("===========action------------->>>");
  // try {
  //   const formData = await request.formData();
  //   const email = formData.get("email") as string;
  //   const password = formData.get("password") as string;

  //   console.log("---sign up-------000000");
  //   const sbServerClient = await getServerClient(request);
  //   const { data, error } = await sbServerClient.auth.signUp({
  //     email,
  //     password,
  //     options: {
  //       data: {
  //         username: "user name",
  //       },
  //     },
  //   });

  //   console.log("---sign up-------1111111");
  //   if (error) {
  //     console.log("---sign up-----error", error);
  //     return { error: error.message };
  //   }

  //   console.log("---sign up----data", data);
  //   return { user: data.user };
  // } catch (error) {
  //   if (error instanceof Error) {
  //     return { error: error.message };
  //   }
  //   return { error: "An unknown error occurred" };
  // }

  // バリデーション
  // const errors: { email?: string; password?: string; general?: string } = {};

  // if (!email) {
  //   errors.email = "メールアドレスを入力してください";
  // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  //   errors.email = "有効なメールアドレスを入力してください";
  // }

  // if (!password) {
  //   errors.password = "パスワードを入力してください";
  // } else if (password.length < 6) {
  //   errors.password = "パスワードは6文字以上で入力してください";
  // }

  // if (Object.keys(errors).length > 0) {
  //   return { errors, email };
  // }

  // try {
  //   // Supabase認証
  //   await signIn(email, password);

  //   // 成功時はダッシュボードにリダイレクト
  //   return redirect("/");
  // } catch (error) {
  //   console.error("Login error:", error);
  //   return {
  //     errors: {
  //       general:
  //         error instanceof Error ? error.message : "ログインに失敗しました",
  //     },
  //     email,
  //   };
  // }
}

export default function LoginPage({ loaderData }: Route.ComponentProps) {
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const { env } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const navigate = useNavigate();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const dataFields = Object.fromEntries(formData.entries());
    const supabase = await getBrowserClient(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY
    );
    const { data, error } = await supabase.auth.signInWithPassword({
      email: dataFields.email as string,
      password: dataFields.password as string,
    });

    if (error) {
      setErrors((errs) => {
        return { ...errs, general: error.message };
      });
      return;
    }

    if (data.session) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="space-y-6">
      {/* ログインフォーム */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">ログイン</h2>

        <Form method="post" className="space-y-4" onSubmit={onSubmit}>
          {/* 全般エラー */}
          {errors?.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* メールアドレス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              defaultValue={""}
              placeholder="your@email.com"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700 ${
                errors?.email
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
              disabled={isSubmitting}
              required
            />
            {errors?.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* パスワード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700 ${
                errors?.password
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
              disabled={isSubmitting}
              required
            />
            {errors?.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* ログインボタン */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                ログイン中...
              </>
            ) : (
              "ログイン"
            )}
          </button>
        </Form>

        {/* アカウント作成リンク */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでない方は{" "}
            <Link
              to="/register"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              新規登録
            </Link>
          </p>
        </div>
      </div>

      {/* デモ用の案内 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          💡 開発中のデモ
        </h3>
        <div className="text-xs text-blue-700 space-y-1">
          <p>• 実際のSupabase認証が実装されています</p>
          <p>• テストアカウントでログインできます</p>
          <p>• 新規登録も可能です</p>
        </div>
      </div>

      {/* ナビゲーション（デバッグ用） */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          ナビゲーション
        </h3>
        <div className="space-y-2">
          <Link
            to="/"
            className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm transition-colors"
          >
            🏠 ダッシュボードへ（要ログイン）
          </Link>
          <Link
            to="/register"
            className="block w-full text-center bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded-lg text-sm transition-colors"
          >
            📝 新規登録ページへ
          </Link>
        </div>
      </div>
    </div>
  );
}
