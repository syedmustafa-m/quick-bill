"use client";
import NextTopLoader from "nextjs-toploader";
import { useTheme } from "./ThemeProvider";

export default function ThemeAwareTopLoader() {
  const { themeColors } = useTheme();
  
  return (
    <NextTopLoader 
      color={themeColors.start}
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow={`0 0 10px ${themeColors.start},0 0 5px ${themeColors.start}`}
    />
  );
} 