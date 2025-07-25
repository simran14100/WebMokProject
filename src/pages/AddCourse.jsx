import React from "react";
import { useSelector } from "react-redux";
import RenderSteps from "../components/core/AddCourse/RenderSteps";

export default function AddCourse() {
  const { user, loading } = useSelector((state) => state.profile);
  console.log("Current user:", user);

  if (loading || user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-yellow-500">Loading...</h1>
      </div>
    );
  }

  if (user?.accountType !== "Instructor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied: Only instructors can add courses.</h1>
      </div>
    );
  }

  return (
    <div className="w-full">
      <RenderSteps />
    </div>
  );
} 