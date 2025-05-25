// app/pages/login.tsx
import { Link } from "react-router";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🐾</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            PetCare にログイン
          </h1>
          <p className="text-gray-600">
            ペットの健康管理を始めましょう
          </p>
        </div>

        {/* ログインフォーム（仮） */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ログインフォーム
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input 
                type="email"
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input 
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled
              />
            </div>
            
            <button 
              disabled
              className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
            >
              ログイン（未実装）
            </button>
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ページナビゲーション
          </h3>
          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors"
            >
              🏠 ホームページへ
            </Link>
            
            <Link
              to="/login"
              className="block w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors"
            >
              🔐 ログイン（現在のページ）
            </Link>
            
            <Link
              to="/settings"
              className="block w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors"
            >
              ⚙️ 設定ページへ
            </Link>
          </div>
        </div>

        {/* 追加情報 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            現在：<span className="font-mono bg-gray-100 px-2 py-1 rounded">
              /login
            </span> ページ
          </p>
        </div>
      </div>
    </div>
  );
}