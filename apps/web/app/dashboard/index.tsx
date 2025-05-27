// app/pages/home.tsx
import { Link, useLoaderData } from "react-router";
import { useNavigate } from "react-router";
import { useCallback } from "react";
import type { Route } from "./+types/index";
import { getServerClient, signOut } from "../util/supabase/supabaseClient";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const supabase = await getServerClient(request);
  return {
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL!,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    },
  };
};

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { env } = loaderData;

  const handleLogout = useCallback(async () => {
    const error = await signOut(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    if (!error) return navigate("/login");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">🐾 Munchi</h1>
            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ⚙️ Settings
              </Link>
              <button
                onClick={handleLogout}
                className="ml-2 text-gray-600 hover:text-red-600 transition-colors border border-gray-300 rounded px-3 py-1 text-sm"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ホーム画面</h2>
          <p className="text-gray-600">ペットの日常を簡単に記録・管理</p>
        </div>

        {/* ナビゲーションボタン */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ページナビゲーション
            </h3>
            <div className="space-y-3">
              <Link
                to="/"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors"
              >
                🏠 ホーム（現在のページ）
              </Link>

              <Link
                to="/login"
                className="block w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors"
              >
                🔐 ログインページへ
              </Link>

              <Link
                to="/settings"
                className="block w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors"
              >
                ⚙️ 設定ページへ
              </Link>
            </div>
          </div>

          {/* 将来の機能プレビュー */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              今後実装予定の機能
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
              >
                🍽️ 食事記録（未実装）
              </button>
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
              >
                🚽 トイレ記録（未実装）
              </button>
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
              >
                💊 薬記録（未実装）
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
