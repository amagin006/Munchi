import React, { useState } from "react";
import { Form, Link, useNavigate } from "react-router";
import type { Route } from "./+types/RecordFeeding";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Clock,
  Heart,
  TrendingUp,
  History,
  Plus,
  Check,
  Settings,
} from "lucide-react";
import { Header } from "@/components/ui/Header";
import { getServerClient } from "@/util/supabase/server";
import { signOut } from "@/util/supabase/client";
import { getPets } from "@/lib/pets/pets";
import { getAllFoodMaster } from "@/lib/foods/foodMaster";
import type { Pet } from "@/lib/pets/types";
import type { FoodMaster } from "@/lib/foods/types";

interface LoaderData {
  env: {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
  };
  pets: Pet[];
  favoriteFoods: FoodMaster[];
  popularFoods: FoodMaster[];
  recentFoods: FoodMaster[];
  allFoods: FoodMaster[];
  selectedPetId?: string;
  error?: string;
}

// Helper function to determine meal type based on current time
const getMealTypeFromTime = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 21) return "dinner";
  return "snack";
};

export const loader = async ({
  request,
}: Route.LoaderArgs): Promise<LoaderData> => {
  const baseData = {
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
    },
  };

  try {
    const supabase = await getServerClient(request);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        ...baseData,
        pets: [],
        favoriteFoods: [],
        popularFoods: [],
        recentFoods: [],
        allFoods: [],
        error: "Authentication required",
      };
    }
    const url = new URL(request.url);
    const selectedPetId = url.searchParams.get("petId");

    const { data: pets, error: petsError } = await getPets(supabase);

    if (petsError) {
      console.error("Error fetching pets:", petsError);
      return {
        ...baseData,
        pets: [],
        favoriteFoods: [],
        popularFoods: [],
        recentFoods: [],
        allFoods: [],
        error: "Failed to fetch pets",
      };
    }

    // 1回のAPIコールで全て取得
    const { data: allFoods, error: foodsError } =
      await getAllFoodMaster(supabase);

    if (foodsError) {
      console.error("Error fetching foods:", foodsError);
      return {
        ...baseData,
        pets: pets || [],
        favoriteFoods: [],
        popularFoods: [],
        recentFoods: [],
        allFoods: [],
        error: "Failed to fetch foods",
      };
    }

    // JS側で分類
    const favoriteFoods = (allFoods || []).filter((f) => f.is_favorite);
    const popularFoods = (allFoods || [])
      .filter((f) => !f.is_favorite && f.usage_count > 0)
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 5);
    const recentFoods = (allFoods || [])
      .filter((f) => !f.is_favorite && f.last_used_at)
      .sort((a, b) => {
        const dateA = a.last_used_at ? new Date(a.last_used_at).getTime() : 0;
        const dateB = b.last_used_at ? new Date(b.last_used_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    return {
      ...baseData,
      pets: pets || [],
      favoriteFoods: favoriteFoods || [],
      popularFoods: popularFoods || [],
      recentFoods: recentFoods || [],
      allFoods: allFoods || [],
    };
  } catch (error) {
    console.error("Loader error:", error);
    return {
      ...baseData,
      pets: [],
      favoriteFoods: [],
      popularFoods: [],
      recentFoods: [],
      allFoods: [],
      error: "An unexpected error occurred",
    };
  }
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

    const petId = formData.get("petId") as string;
    const foodId = formData.get("foodId") as string;
    const mealType = formData.get("mealType") as string;
    const amountGiven =
      parseFloat(formData.get("amountGiven") as string) || null;

    // Insert food record
    const { error: recordError } = await supabase.from("food_records").insert({
      user_id: user.id,
      pet_id: petId,
      meal_time: new Date().toISOString(),
      meal_type: mealType,
      eating_status: "all",
      amount_given: amountGiven,
      amount_eaten: amountGiven, // Assume all eaten by default
    });

    if (recordError) {
      console.error("Error inserting food record:", recordError);
      return { error: "Failed to save feeding record" };
    }

    // Update food master usage stats (fetch, then increment)
    const { data: foodData, error: foodError } = await supabase
      .from("food_master")
      .select("usage_count")
      .eq("id", foodId)
      .single();

    if (!foodError && foodData) {
      const { error: updateError } = await supabase
        .from("food_master")
        .update({
          usage_count: foodData.usage_count + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq("id", foodId);
      if (updateError) {
        console.error("Error updating food master:", updateError);
        // Don't return error here as the main record was saved
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Action error:", error);
    return { error: "An unexpected error occurred" };
  }
};

export default function RecordFeeding({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const {
    env,
    pets,
    favoriteFoods,
    popularFoods,
    recentFoods,
    selectedPetId,
    error,
    allFoods,
  } = loaderData;
  const [recordingFood, setRecordingFood] = useState<string | null>(null);

  // Get default pet (selected pet or first available)
  const defaultPet = pets.find((p) => p.id === selectedPetId) || pets[0];
  const currentMealType = getMealTypeFromTime();

  const handleLogout = async () => {
    const error = await signOut(
      env.VITE_SUPABASE_URL,
      env.VITE_SUPABASE_ANON_KEY
    );
    if (!error) navigate("/login");
  };

  const handleQuickRecord = async (food: FoodMaster) => {
    if (!defaultPet) return;

    setRecordingFood(food.id);

    // Create form data for submission
    const formData = new FormData();
    formData.append("petId", defaultPet.id);
    formData.append("foodId", food.id);
    formData.append("mealType", currentMealType);
    formData.append("amountGiven", "50"); // Default amount

    // Submit form programmatically
    const form = document.createElement("form");
    form.method = "POST";
    form.style.display = "none";

    for (const [key, value] of formData.entries()) {
      const input = document.createElement("input");
      input.name = key;
      input.value = value as string;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  };

  const getMealTypeLabel = (mealType: string): string => {
    const labels: Record<string, string> = {
      breakfast: "朝食",
      lunch: "昼食",
      dinner: "夕食",
      snack: "おやつ",
    };
    return labels[mealType] || mealType;
  };

  const formatFoodType = (type: string): string => {
    const types: Record<string, string> = {
      dry: "ドライフード",
      wet: "ウェットフード",
      treat: "おやつ",
      supplement: "サプリメント",
    };
    return types[type] || type;
  };

  // Success state
  if (actionData?.success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onProfileClick={handleLogout} />
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                記録完了！
              </h2>
              <p className="text-gray-600">食事記録が保存されました</p>
            </div>
            <div className="space-y-3 w-full max-w-sm">
              <Link to="/dashboard">
                <Button className="w-full">ダッシュボードに戻る</Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.reload()}
              >
                続けて記録する
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
            <Link to="/dashboard">
              <Button>ダッシュボードに戻る</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // No pets state
  if (pets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onProfileClick={handleLogout} />
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">食事記録</h1>
          </div>

          <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
            <p className="text-gray-600">
              食事記録をするにはペットを登録してください
            </p>
            <Link to="/add-pet">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                ペットを追加
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const FoodCard = ({
    food,
    icon,
    onQuickRecord,
  }: {
    food: FoodMaster;
    icon: React.ReactNode;
    onQuickRecord: (food: FoodMaster) => void;
  }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {icon}
              <h3 className="font-medium text-gray-900 text-sm">{food.name}</h3>
            </div>
            <p className="text-xs text-gray-600">{food.brand}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {formatFoodType(food.type)}
              </Badge>
              {food.usage_count > 0 && (
                <span className="text-xs text-gray-500">
                  {food.usage_count}回使用
                </span>
              )}
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onQuickRecord(food)}
            disabled={recordingFood === food.id}
            className="ml-3"
          >
            {recordingFood === food.id ? "記録中..." : "記録"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onProfileClick={handleLogout} />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">食事記録</h1>
        </div>

        {/* Current Context */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium text-gray-900">
                  {defaultPet?.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {getMealTypeLabel(currentMealType)} •{" "}
                    {new Date().toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <Link to="/record-feeding/details">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  詳細設定
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Favorite Foods */}
        {favoriteFoods.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-medium text-gray-700">お気に入り</h3>
            </div>
            <div className="space-y-2">
              {favoriteFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  icon={<Heart className="h-3 w-3 text-red-500" />}
                  onQuickRecord={handleQuickRecord}
                />
              ))}
            </div>
          </div>
        )}

        {/* Popular Foods */}
        {popularFoods.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-700">
                よく使うフード
              </h3>
            </div>
            <div className="space-y-2">
              {popularFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  icon={<TrendingUp className="h-3 w-3 text-blue-500" />}
                  onQuickRecord={handleQuickRecord}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Foods */}
        {recentFoods.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-medium text-gray-700">
                最近使ったフード
              </h3>
            </div>
            <div className="space-y-2">
              {recentFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  icon={<History className="h-3 w-3 text-green-500" />}
                  onQuickRecord={handleQuickRecord}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Foods */}
        {allFoods && allFoods.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-700">
                すべてのフード
              </h3>
            </div>
            <div className="space-y-2">
              {allFoods
                .filter(
                  (food) =>
                    !favoriteFoods.some((f) => f.id === food.id) &&
                    !popularFoods.some((f) => f.id === food.id) &&
                    !recentFoods.some((f) => f.id === food.id)
                )
                .map((food) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    icon={null}
                    onQuickRecord={handleQuickRecord}
                  />
                ))}
            </div>
          </div>
        )}

        {/* No foods state */}
        {favoriteFoods.length === 0 &&
          popularFoods.length === 0 &&
          recentFoods.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">
                  フードが登録されていません
                </h3>
                <p className="text-gray-600 text-sm">
                  新しいフードを追加して記録を始めましょう
                </p>
              </div>
              <Link to="/addFood">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  フードを追加
                </Button>
              </Link>
            </div>
          )}

        {/* Add New Food Button */}
        {(favoriteFoods.length > 0 ||
          popularFoods.length > 0 ||
          recentFoods.length > 0) && (
          <div className="pt-4 border-t">
            <Link to="/addFood">
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                新しいフードを追加
              </Button>
            </Link>
          </div>
        )}
      </main>

      {/* Hidden form for submissions */}
      <Form method="post" style={{ display: "none" }} />
    </div>
  );
}
