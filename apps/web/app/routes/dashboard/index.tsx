import React, { useState, useCallback } from "react";
import { Link, useNavigate, Form } from "react-router";
import type { Route } from "./+types/index";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Clock,
  Calendar,
  Cat,
  Dog,
  Pill,
  Heart,
  Plus,
} from "lucide-react";
import { signOut } from "@/util/supabase/client";
import { Header } from "@/components/ui/Header";
import { getServerClient } from "@/util/supabase/server";
import { getAllFoodMaster } from "@/lib/foods/foodMaster";
import type { FoodMaster } from "@/lib/foods/types";
import { getPets } from "@/lib/pets/pets";
import type { Pet } from "@/lib/pets/types";

// Helper function to determine meal type based on current time
const getMealTypeFromTime = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 21) return "dinner";
  return "snack";
};

// Helper function to format food type to Japanese
const formatFoodType = (type: string): string => {
  const typeMap: Record<string, string> = {
    dry: "ドライ",
    wet: "ウェット",
    treat: "おやつ",
    supplement: "サプリ",
  };
  return typeMap[type] || type;
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const supabase = await getServerClient(request);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  let todaysRecords = [];
  let favoriteFoods: FoodMaster[] = [];
  let pets: Pet[] = [];
  if (user) {
    const { start, end } = getTodayRange();
    const { data: records, error: recordsError } = await supabase
      .from("food_records")
      .select("*, food_master(*), pets(*)")
      .eq("user_id", user.id)
      .gte("meal_time", start)
      .lt("meal_time", end)
      .order("meal_time", { ascending: false });
    if (!recordsError && records) {
      todaysRecords = records;
    }

    // Fetch favorite foods
    const { data: allFoods, error: foodsError } =
      await getAllFoodMaster(supabase);
    if (!foodsError && allFoods) {
      favoriteFoods = allFoods.filter((food) => food.is_favorite);
    }

    // Fetch user's pets
    const { data: userPets, error: petsError } = await getPets(supabase);
    if (!petsError && userPets) {
      pets = userPets;
    }
  }
  return {
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
    },
    todaysRecords,
    favoriteFoods,
    pets,
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

    const petId = formData.get("petId") as string;
    const foodId = formData.get("foodId") as string;
    const mealType = formData.get("mealType") as string;
    const amountGiven =
      parseFloat(formData.get("amountGiven") as string) || null;

    // Insert food record
    const { error: recordError } = await supabase.from("food_records").insert({
      user_id: user.id,
      pet_id: petId,
      food_id: foodId,
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

    // Update food master usage stats
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
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Action error:", error);
    return { error: "An unexpected error occurred" };
  }
};

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export default function Dashboard({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { env, todaysRecords, favoriteFoods, pets } = loaderData;
  const [recordingFood, setRecordingFood] = useState<string | null>(null);
  const navigate = useNavigate();

  const [selectedPet, setSelectedPet] = useState<Pet | null>(
    pets.length > 0 ? pets[0] : null
  );

  const handleLogout = useCallback(async () => {
    const error = await signOut(
      env.VITE_SUPABASE_URL,
      env.VITE_SUPABASE_ANON_KEY
    );
    if (!error) return navigate("/login");
  }, [navigate]);

  const handleQuickRecord = async (food: FoodMaster) => {
    if (!selectedPet) {
      console.error("No pet selected");
      return;
    }

    setRecordingFood(food.id);

    // Create form data for submission
    const formData = new FormData();
    formData.append("petId", selectedPet.id);
    formData.append("foodId", food.id);
    formData.append("mealType", getMealTypeFromTime());
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

  const todayRecords = [
    { time: "08:00", food: "Morning Kibble", amount: "50g" },
    { time: "12:30", food: "Lunch Treats", amount: "20g" },
    { time: "18:00", food: "Dinner Wet Food", amount: "85g" },
  ];

  const selectedPetData = selectedPet;
  const PetIcon = selectedPetData?.type === "cat" ? Cat : Dog;

  // No pets registered state
  if (pets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header onProfileClick={handleLogout} />

        <main className="max-w-md mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center space-y-6">
            {/* Welcome illustration */}
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-blue-100 rounded-full flex items-center justify-center">
              <div className="flex gap-2">
                <Cat className="h-12 w-12 text-orange-500" />
                <Dog className="h-12 w-12 text-blue-500" />
              </div>
            </div>

            {/* Welcome message */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome to Munchi!
              </h2>
              <p className="text-gray-600 max-w-sm">
                Start tracking your pet's meals and medications by registering
                your first pet.
              </p>
            </div>

            {/* Call to action */}
            <div className="space-y-4 w-full max-w-sm">
              <Link to="/addPet">
                <Button className="w-full h-12 text-lg" size="lg">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Your First Pet
                </Button>
              </Link>

              <div className="text-xs text-gray-500 space-y-1">
                <p>You can add multiple pets and switch between them anytime</p>
              </div>
            </div>

            {/* Features preview */}
            <div className="w-full max-w-sm mt-8 space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                What you can track:
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Feeding Times
                    </p>
                    <p className="text-xs text-gray-600">
                      Track meals and amounts
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Pill className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Medications
                    </p>
                    <p className="text-xs text-gray-600">Never miss a dose</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Hidden form for submissions */}
        <Form method="post" style={{ display: "none" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header onProfileClick={handleLogout} />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Pet Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Select Pet
            </label>
            <Link to="/addPet">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Pet
              </Button>
            </Link>
          </div>
          <Select
            value={selectedPet?.id || ""}
            onValueChange={(value) => {
              const pet = pets.find((p) => p.id === value);
              setSelectedPet(pet || null);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pets.map((pet) => (
                <SelectItem key={pet.id} value={pet.id}>
                  <div className="flex items-center gap-2">
                    {pet.type === "cat" ? (
                      <Cat className="h-4 w-4" />
                    ) : (
                      <Dog className="h-4 w-4" />
                    )}
                    {pet.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Pet Info Card */}
        {selectedPetData && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                  <PetIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedPetData.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {selectedPetData.type === "cat" ? "Cat" : "Dog"}
                    </Badge>
                    {selectedPetData.age && (
                      <span className="text-sm text-gray-600">
                        {selectedPetData.age} years
                      </span>
                    )}
                  </div>
                  {selectedPetData.weight && (
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedPetData.weight} {selectedPetData.weight_unit || 'kg'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Meals recorded</span>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {todaysRecords.length} meals
              </Badge>
            </div>
            {todaysRecords && todaysRecords.length > 0 && (
              <div className="mt-3 space-y-2">
                {todaysRecords.slice(0, 3).map((record, index) => {
                  const PetIcon = record.pets?.type === "cat" ? Cat : Dog;
                  return (
                    <div
                      key={record.id || index}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <PetIcon className="h-3 w-3 text-gray-500" />
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {record.food_master?.name || "Unknown Food"}
                            </span>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {record.pets?.name || "Unknown Pet"}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {record.meal_type && record.meal_type.charAt(0).toUpperCase() + record.meal_type.slice(1)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 ml-2">
                        {new Date(record.meal_time).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>
                    </div>
                  );
                })}
                {todaysRecords.length > 3 && (
                  <div className="text-center">
                    <span className="text-xs text-gray-500">
                      +{todaysRecords.length - 3} more meals
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Quick Actions</h3>

          {/* Favorite Foods for One-Click Recording */}
          {favoriteFoods && favoriteFoods.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      お気に入りフード
                    </span>
                  </div>
                  <div className="space-y-2">
                    {favoriteFoods.slice(0, 4).map((food) => (
                      <div
                        key={food.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {food.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-xs bg-gray-200 text-gray-700 border-0 ml-2"
                            >
                              {formatFoodType(food.type)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleQuickRecord(food)}
                          disabled={recordingFood === food.id}
                          className="h-10 w-10 p-0 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
                        >
                          {recordingFood === food.id ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <Plus className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="space-y-2">
            <Link to="/recordFeeding">
              <Button
                className="w-full h-12 text-left justify-start gap-3"
                size="lg"
              >
                <PlusCircle className="h-5 w-5" />
                Record Feeding
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full h-12 text-left justify-start gap-3"
              size="lg"
            >
              <Pill className="h-5 w-5" />
              Record Medication
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
