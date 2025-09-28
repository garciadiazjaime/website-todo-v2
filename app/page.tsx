"use client";

import { useState, useEffect } from "react";

import TodoList from "@/app/components/TodoList";

export default function Home() {
  const [orientation, setOrientation] = useState("portrait");

  useEffect(() => {
    setOrientation(
      window.matchMedia("(orientation: portrait)").matches
        ? "portrait"
        : "landscape"
    );

    const handleOrientationChange = () => {
      setOrientation(
        window.matchMedia("(orientation: portrait)").matches
          ? "portrait"
          : "landscape"
      );
    };

    // Add listener for orientation changes
    window.addEventListener("resize", handleOrientationChange);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: orientation === 'portrait' ? "column" : "initial",
        maxWidth: 1200,
        margin: "0 auto",
        gap: 20,
        padding: 20,
      }}
    >
      <TodoList list="VALLEY" orientation={orientation} />
      <TodoList list="TRADER" orientation={orientation} />
    </div>
  );
}
