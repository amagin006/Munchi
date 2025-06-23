"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router";
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
import { ArrowLeft, Cat, Dog, Heart, Save, AlertCircle } from "lucide-react";
import {
  type PetForm,
  validatePetForm,
  transformFormToPetInsert,
  getPetTypeDisplayName,
} from "@/lib/pets/types";
import { createPet } from "@/lib/pets/pets";
import { createClient } from "@/util/supabase/client";

interface AddPetProps {
  createPetAction: (formData: FormData) => Promise<any>;
}

export default function AddPet({ createPetAction }: AddPetProps) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PetForm>({
    name: "",
    type: undefined as any,
    age: "",
    weight: "",
    weight_unit: "kg",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof PetForm, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const validation = validatePetForm(formData);

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((error) => {
        if (error.path.length > 0) {
          newErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Transform form data to insert data
      const petInsertData = transformFormToPetInsert(formData);

      // Create pet in Supabase
      const supabaseClient = createClient();
      const { data, error } = await createPet(supabaseClient, petInsertData);

      if (error) {
        // Show error message
        setErrors({ submit: error.message || "Failed to create pet" });
        return;
      }

      if (data) {
        // Success! Navigate back to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setErrors({ submit: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    console.log("----------");
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
          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
            </div>
          )}

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
                  value={formData.type ?? ""}
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
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your pet's name"
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
                  value={
                    formData.age !== null && formData.age !== undefined
                      ? formData.age.toString()
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange("age", value);
                  }}
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
                      setErrors((prev) => ({ ...prev, age: "" }));
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
                    value={
                      formData.weight !== null && formData.weight !== undefined
                        ? formData.weight.toString()
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange("weight", value);
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value && parseFloat(value) > 999) {
                        setFormData((prev) => ({ ...prev, weight: "999" }));
                        setErrors((prev) => ({
                          ...prev,
                          weight: "Please enter a valid weight (0-999)",
                        }));
                      } else if (errors.weight) {
                        setErrors((prev) => ({ ...prev, weight: "" }));
                      }
                    }}
                    placeholder="e.g., 4.2"
                    className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.weight ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <Select
                    value={formData.weight_unit}
                    onValueChange={(value) =>
                      handleInputChange("weight_unit", value)
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
                      {formData.name || "Your Pet"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {formData.type && (
                        <Badge variant="secondary" className="text-xs">
                          {getPetTypeDisplayName(formData.type)}
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
                        {formData.weight} {formData.weight_unit}
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
              disabled={isLoading || !formData.name || !formData.type}
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
