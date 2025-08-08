import React, { useState } from "react";
import { Form, Link, useNavigate } from "react-router";
import type { Route } from "./+types/AddFood";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Save,
  Heart,
  Info,
  Package,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Header } from "@/components/ui/Header";
import { getServerClient } from "@/util/supabase/server";
import { signOut } from "@/util/supabase/client";
import { createFood } from "@/lib/foods/foodMaster";

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

export const action = async ({ request }: Route.ActionArgs) => {
  try {
    const supabase = await getServerClient(request);
    const formData = await request.formData();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: "Authentication required" };
    }

    // Extract form data
    const name = (formData.get("name") as string) || "";
    const brand = (formData.get("brand") as string) || "";
    const type = (formData.get("type") as string) || "";
    const caloriesPer100g = (formData.get("caloriesPer100g") as string) || "";
    const proteinPer100g = (formData.get("proteinPer100g") as string) || "";
    const fatPer100g = (formData.get("fatPer100g") as string) || "";
    const carbPer100g = (formData.get("carbPer100g") as string) || "";
    const packageSize = (formData.get("packageSize") as string) || "";
    const price = (formData.get("price") as string) || "";
    const purchaseUrl = (formData.get("purchaseUrl") as string) || "";
    const isFavorite = formData.get("isFavorite") === "true";

    // Validate required fields
    if (!name.trim() || !type.trim()) {
      return { error: "フード名とタイプは必須です" };
    }

    // Build food data object
    const foodData = {
      name: name.trim(),
      brand: brand.trim(),
      type,
      calories_per_100g: caloriesPer100g ? parseFloat(caloriesPer100g) : null,
      protein_per_100g: proteinPer100g ? parseFloat(proteinPer100g) : null,
      fat_per_100g: fatPer100g ? parseFloat(fatPer100g) : null,
      carb_per_100g: carbPer100g ? parseFloat(carbPer100g) : null,
      package_size: packageSize ? packageSize.trim() : null,
      price: price ? parseFloat(price) : null,
      purchase_url: purchaseUrl.trim() || null,
      is_favorite: isFavorite,
      is_active: true,
      usage_count: 0,
    };

    // Insert new food using the new function
    const { error } = await createFood(supabase, foodData);
    if (error) {
      console.error("Error inserting food:", error);
      return { error: "フードの保存に失敗しました" };
    }
    return { success: true };
  } catch (error) {
    console.error("Action error:", error);
    return { error: "予期しないエラーが発生しました" };
  }
};

interface AddFoodProps {
  loaderData: LoaderData;
  actionData: any;
}

export default function AddFood({ loaderData, actionData }: AddFoodProps) {
  const navigate = useNavigate();
  const { env, error } = loaderData;
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleLogout = async () => {
    const error = await signOut(
      env.VITE_SUPABASE_URL,
      env.VITE_SUPABASE_ANON_KEY
    );
    if (!error) navigate("/login");
  };

  // Success state
  if (actionData?.success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onProfileClick={handleLogout} />
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Save className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                フードを追加しました！
              </h2>
              <p className="text-gray-600">新しいフードが保存されました</p>
            </div>
            <div className="space-y-3 w-full max-w-sm">
              <Link to="/recordFeeding">
                <Button className="w-full">食事記録に戻る</Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.reload()}
              >
                続けて追加する
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || actionData?.error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onProfileClick={handleLogout} />
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <div className="text-red-600 text-2xl">!</div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                エラーが発生しました
              </h2>
              <p className="text-gray-600">{error || actionData?.error}</p>
            </div>
            <Link to="/recordFeeding">
              <Button>食事記録に戻る</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onProfileClick={handleLogout} />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/recordFeeding">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">フードを追加</h1>
        </div>

        <Form method="post" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5" />
                基本情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">フード名 *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="例: ロイヤルカナン アダルト"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">ブランド名</Label>
                <Input
                  id="brand"
                  name="brand"
                  placeholder="例: ロイヤルカナン"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">フードタイプ *</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="タイプを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dry">ドライフード</SelectItem>
                    <SelectItem value="wet">ウェットフード</SelectItem>
                    <SelectItem value="treat">おやつ</SelectItem>
                    <SelectItem value="supplement">サプリメント</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="isFavorite" name="isFavorite" value="true" />
                <Label htmlFor="isFavorite" className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  お気に入りに追加
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings Toggle */}
          <Button
            type="button"
            variant="expandable"
            isExpanded={showAdvanced}
            expandedLabel="詳細設定を閉じる"
            collapsedLabel="詳細設定（オプション）"
            onClick={() => setShowAdvanced(!showAdvanced)}
          />

          {/* Advanced Information */}
          {showAdvanced && (
            <>
              {/* Nutrition Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    栄養成分（100gあたり）
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="caloriesPer100g">カロリー (kcal)</Label>
                      <Input
                        id="caloriesPer100g"
                        name="caloriesPer100g"
                        type="number"
                        step="0.1"
                        placeholder="350"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proteinPer100g">タンパク質 (g)</Label>
                      <Input
                        id="proteinPer100g"
                        name="proteinPer100g"
                        type="number"
                        step="0.1"
                        placeholder="25"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatPer100g">脂質 (g)</Label>
                      <Input
                        id="fatPer100g"
                        name="fatPer100g"
                        type="number"
                        step="0.1"
                        placeholder="15"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carbPer100g">炭水化物 (g)</Label>
                      <Input
                        id="carbPer100g"
                        name="carbPer100g"
                        type="number"
                        step="0.1"
                        placeholder="5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    商品情報
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="packageSize">パッケージサイズ</Label>
                      <Input
                        id="packageSize"
                        name="packageSize"
                        type="text"
                        placeholder="2kg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">価格 (円)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        placeholder="3500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchaseUrl">購入URL</Label>
                    <Input
                      id="purchaseUrl"
                      name="purchaseUrl"
                      type="url"
                      placeholder="https://example.com/product"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Submit Button */}
          <div className="space-y-3">
            <div className="mb-4">
              <Button type="submit" variant="primary" size="lg">
                <Save className="h-5 w-5 mr-2" />
                フードを保存
              </Button>
            </div>
            <Link to="/recordFeeding">
              <Button variant="outline" className="w-full">
                キャンセル
              </Button>
            </Link>
          </div>
        </Form>
      </main>
    </div>
  );
}
