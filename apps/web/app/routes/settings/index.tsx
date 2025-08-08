import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/index";
import { signOut } from "@/util/supabase/client";

interface LoaderData {
  env: {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
  };
  error?: string;
}

export const loader = async ({
  request,
}: Route.LoaderArgs): Promise<LoaderData> => {
  return {
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
    },
  };
};

export default function SettingsPage({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { env } = loaderData;

  const handleLogout = async () => {
    const error = await signOut(
      env.VITE_SUPABASE_URL,
      env.VITE_SUPABASE_ANON_KEY
    );
    if (!error) navigate("/login");
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              ← 戻る
            </Link>
            <h1 className="text-xl font-bold text-gray-900">⚙️ 設定</h1>
            <div className="w-12"></div> {/* スペーサー */}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto px-4 py-6">
        {/* 設定項目 */}
        <div className="space-y-4">
          {/* プロフィール設定 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              プロフィール設定
            </h3>
            <div className="space-y-3">
              <button
                disabled
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium text-left cursor-not-allowed"
              >
                👤 アカウント情報（未実装）
              </button>
            </div>
          </div>

          {/* ペット設定 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ペット設定
            </h3>
            <div className="space-y-3">
              <button
                disabled
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium text-left cursor-not-allowed"
              >
                🐕 ペット管理（未実装）
              </button>
              <button
                disabled
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium text-left cursor-not-allowed"
              >
                📊 データエクスポート（未実装）
              </button>
            </div>
          </div>

          {/* アプリ設定 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              アプリ設定
            </h3>
            <div className="space-y-3">
              <button
                disabled
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium text-left cursor-not-allowed"
              >
                🎨 テーマ設定（未実装）
              </button>
              <button
                disabled
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium text-left cursor-not-allowed"
              >
                🌐 言語設定（未実装）
              </button>
            </div>
          </div>

          {/* アカウント */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              アカウント
            </h3>
            <div className="space-y-3">
              <Link
                to="/dashboard"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors"
              >
                🏠 ダッシュボードへ戻る
              </Link>

              <button
                onClick={handleLogout}
                className="block w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors"
              >
                🚪 ログアウト
              </button>
            </div>
          </div>
        </div>

        {/* 現在のパス表示 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            現在：
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              /settings
            </span>{" "}
            ページ
          </p>
        </div>
      </main>
    </div>
  );
}
