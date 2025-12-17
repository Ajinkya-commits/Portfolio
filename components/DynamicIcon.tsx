"use client";

import * as TablerIcons from "@tabler/icons-react";
import { IconQuestionMark } from "@tabler/icons-react";

interface DynamicIconProps {
  iconName: string;
  className?: string;
}

export function DynamicIcon({
  iconName,
  className = "h-full w-full text-neutral-500 dark:text-neutral-300",
}: DynamicIconProps) {
  const Icon = (
    TablerIcons as unknown as Record<
      string,
      React.ComponentType<{ className?: string }>
    >
  )[iconName];

  return Icon ? (
    <Icon className={className} />
  ) : (
    <IconQuestionMark className={className} />
  );
}
