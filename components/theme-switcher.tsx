"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 20;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full p-2 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 dark:border-blue-700">
          {theme === "light" ? (
            <Sun key="light" size={ICON_SIZE} className="text-amber-500" />
          ) : theme === "dark" ? (
            <Moon key="dark" size={ICON_SIZE} className="text-indigo-400" />
          ) : (
            <Laptop key="system" size={ICON_SIZE} className="text-blue-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[120px]" align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(e) => setTheme(e)}
        >
          <DropdownMenuRadioItem className="flex items-center justify-start" value="light">
            <Sun size={ICON_SIZE} className="text-amber-500" />
            <span className="ml-2">浅色</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex items-center justify-start" value="dark">
            <Moon size={ICON_SIZE} className="text-indigo-400" />
            <span className="ml-2">深色</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex items-center justify-start" value="system">
            <Laptop size={ICON_SIZE} className="text-blue-500" />
            <span className="ml-2">系统</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };
