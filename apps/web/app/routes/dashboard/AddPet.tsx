import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Cat, Dog, Heart, Save, AlertCircle } from "lucide-react";

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

type PetFormData = {
  name: string;
  type: string;
  age: string;
  weight: string;
  weightUnit: string;
};

type PetFormErrors = {
  name?: string | null;
  type?: string | null;
  age?: string | null;
  weight?: string | null;
};

export default function AddPet() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PetFormData>({
    name: "",
    type: "",
    age: "",
    weight: "",
    weightUnit: "kg",
  });

  const [errors, setErrors] = useState<PetFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof PetFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing (weightUnitにはエラーがないので除外)
    if (field !== "weightUnit" && errors[field as keyof PetFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: PetFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Pet name is required";
    }

    if (!formData.type) {
      newErrors.type = "Pet type is required";
    }

    if (
      formData.age &&
      (!/^\d+$/.test(formData.age) ||
        parseInt(formData.age, 10) < 0 ||
        parseInt(formData.age, 10) > 99)
    ) {
      newErrors.age = "Please enter a valid age (0-99)";
    }

    if (
      formData.weight &&
      (isNaN(Number(formData.weight)) ||
        parseFloat(formData.weight) <= 0 ||
        parseFloat(formData.weight) > 999)
    ) {
      newErrors.weight = "Please enter a valid weight (0-999)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Pet data to save:", formData);
      // Here you would integrate with Supabase
      // await savePetToDatabase(formData);

      // Navigate back to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving pet:", error);
      alert("Failed to register pet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Add New Pet</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Pet Type Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Pet Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pet Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Pet Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger
                    className={errors.type ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select pet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cat">
                      <div className="flex items-center gap-2">
                        <Cat className="h-4 w-4" />
                        Cat
                      </div>
                    </SelectItem>
                    <SelectItem value="dog">
                      <div className="flex items-center gap-2">
                        <Dog className="h-4 w-4" />
                        Dog
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Other
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.type}
                  </p>
                )}
              </div>

              {/* Pet Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Pet Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    handleInputChange("name", e.target.value.slice(0, 30))
                  }
                  placeholder="Enter your pet's name"
                  maxLength={30}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Optional Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Additional Info</CardTitle>
              <p className="text-sm text-gray-600">
                Optional - you can add this information later
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Age */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Age (years)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="99"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value && parseInt(value, 10) > 99) {
                      setFormData((prev) => ({ ...prev, age: "99" }));
                      setErrors((prev) => ({
                        ...prev,
                        age: "Please enter a valid age (0-99)",
                      }));
                    } else if (errors.age) {
                      // フォーカスアウト時にエラーが解消されたら消す
                      setErrors((prev) => ({ ...prev, age: null }));
                    }
                  }}
                  placeholder="e.g. 2"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.age ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.age && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.age}
                  </p>
                )}
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Weight
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="999"
                    value={formData.weight}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value && parseFloat(value) > 999) {
                        setFormData((prev) => ({ ...prev, weight: "999" }));
                        setErrors((prev) => ({
                          ...prev,
                          weight: "Please enter a valid weight (0-999)",
                        }));
                      } else if (errors.weight) {
                        setErrors((prev) => ({ ...prev, weight: null }));
                      }
                    }}
                    placeholder="e.g., 4.2"
                    className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.weight ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <Select
                    value={formData.weightUnit}
                    onValueChange={(value) =>
                      handleInputChange("weightUnit", value)
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lbs">lbs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.weight && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.weight}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {(formData.name || formData.type) && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-900">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                    {formData.type === "cat" ? (
                      <Cat className="h-6 w-6 text-orange-600" />
                    ) : formData.type === "dog" ? (
                      <Dog className="h-6 w-6 text-orange-600" />
                    ) : (
                      <Heart className="h-6 w-6 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900">
                      {formData.name
                        ? formData.name.length > 30
                          ? formData.name.slice(0, 30) + "…"
                          : formData.name
                        : "Your Pet"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {formData.type && (
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {formData.type}
                        </Badge>
                      )}
                      {formData.age && (
                        <span className="text-sm text-blue-700">
                          {formData.age} years
                        </span>
                      )}
                    </div>
                    {formData.weight && (
                      <p className="text-sm text-blue-700 mt-1">
                        {formData.weight} {formData.weightUnit}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleBack}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 font-bold shadow-lg  bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Pet
                </div>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
