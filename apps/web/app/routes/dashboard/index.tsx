import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
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
import { PlusCircle, Clock, Calendar, Cat, Dog, Pill } from "lucide-react";
import { signOut } from "@/util/supabase/client";
import { Header } from "@/components/ui/Header";
import { getServerClient } from "@/util/supabase/server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const supabase = await getServerClient(request);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  let todaysRecords = [];
  if (user) {
    const { start, end } = getTodayRange();
    const { data: records, error: recordsError } = await supabase
      .from("food_records")
      .select("*, food_master(*)")
      .eq("user_id", user.id)
      .gte("meal_time", start)
      .lt("meal_time", end)
      .order("meal_time", { ascending: false });
    console.log("records", records);
    console.log("error", recordsError);
    if (!recordsError && records) {
      todaysRecords = records;
    }
  }
  return {
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
    },
    todaysRecords,
  };
};

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const [selectedPet, setSelectedPet] = useState("momo");
  const navigate = useNavigate();
  const { env, todaysRecords } = loaderData;

  const handleLogout = useCallback(async () => {
    const error = await signOut(
      env.VITE_SUPABASE_URL,
      env.VITE_SUPABASE_ANON_KEY
    );
    if (!error) return navigate("/login");
  }, [navigate]);

  // Mock data - set to empty array to test no pets state
  // const pets = [];
  const pets = [
    { id: "momo", name: "Momo", type: "cat", age: "3 years", weight: "4.2 kg" },
    { id: "coco", name: "Coco", type: "dog", age: "2 years", weight: "8.5 kg" },
  ];

  const todayRecords = [
    { time: "08:00", food: "Morning Kibble", amount: "50g" },
    { time: "12:30", food: "Lunch Treats", amount: "20g" },
    { time: "18:00", food: "Dinner Wet Food", amount: "85g" },
  ];

  const selectedPetData = pets.find((pet) => pet.id === selectedPet);
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
          <Select value={selectedPet} onValueChange={setSelectedPet}>
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
                    <span className="text-sm text-gray-600">
                      {selectedPetData.age}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedPetData.weight}
                  </p>
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
                {todayRecords.length} meals
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last feeding</span>
              <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {todayRecords[todayRecords.length - 1]?.time || "No records"}
              </span>
            </div>
            {todaysRecords && todaysRecords.length > 0 && (
              <div className="pt-4">
                <h2 className="text-base font-semibold mb-2">今日の記録</h2>
                <ul className="space-y-2">
                  {todaysRecords.map((rec) => (
                    <li
                      key={rec.id}
                      className="p-3 bg-gray-50 rounded shadow flex flex-col"
                    >
                      <span className="font-medium">
                        {rec.food_master?.name || "(不明なフード)"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(rec.meal_time).toLocaleTimeString("ja-JP", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <Link to="/recordFeeding">
              <Button className="h-12 text-left justify-start gap-3" size="lg">
                <PlusCircle className="h-5 w-5" />
                Record Feeding
              </Button>
            </Link>
            <Button
              variant="outline"
              className="h-12 text-left justify-start gap-3"
              size="lg"
            >
              <Pill className="h-5 w-5" />
              Record Medication
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {todayRecords.length > 0 ? (
              <div className="space-y-3">
                {todayRecords
                  .slice()
                  .reverse()
                  .map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {record.food}
                          </p>
                          <p className="text-xs text-gray-600">
                            {record.amount}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {record.time}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No feeding records today</p>
                <p className="text-xs mt-1">
                  Tap "Record Feeding" to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
