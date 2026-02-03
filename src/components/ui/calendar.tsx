"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      className={cn(
        "size-9 p-0 font-normal",
        modifiers.selected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        modifiers.today && !modifiers.selected && "bg-accent text-accent-foreground",
        modifiers.outside && "text-muted-foreground/50 opacity-50",
        modifiers.disabled && "text-muted-foreground/50 opacity-50",
        modifiers.hidden && "invisible",
        className
      )}
      {...props}
    />
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      captionLayout={captionLayout}
      classNames={{
        [defaultClassNames.months]: "flex flex-col sm:flex-row gap-4",
        [defaultClassNames.month]: "flex flex-col gap-4",
        [defaultClassNames.month_caption]: "flex justify-center pt-1 relative items-center",
        [defaultClassNames.caption_label]: "text-sm font-medium",
        [defaultClassNames.nav]: "flex items-center gap-1",
        [defaultClassNames.button_previous]: cn(
          "absolute left-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        [defaultClassNames.button_next]: cn(
          "absolute right-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        [defaultClassNames.month_grid]: "mt-4",
        [defaultClassNames.weekdays]: "flex",
        [defaultClassNames.weekday]: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        [defaultClassNames.week]: "flex w-full mt-2",
        [defaultClassNames.day]: cn(
          "size-9 text-center text-sm relative",
          "[&:has([data-selected])]:bg-accent [&:has([data-selected][data-outside])]:bg-accent/50",
          "[&:has([data-selected])]:rounded-md"
        ),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="size-4" />
        },
        DayButton: CalendarDayButton,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
