import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChangeCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: scheduledChanges, isLoading } = useQuery({
    queryKey: ["change-calendar", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from("change_requests")
        .select("*")
        .eq("is_deleted", false)
        .not("change_calendar_date", "is", null)
        .gte("change_calendar_date", start.toISOString())
        .lte("change_calendar_date", end.toISOString())
        .order("change_calendar_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getChangesForDay = (day: Date) => {
    if (!scheduledChanges) return [];
    return scheduledChanges.filter((change) =>
      isSameDay(new Date(change.change_calendar_date!), day)
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto py-4 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Change Calendar</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[200px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center font-semibold text-sm p-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map((day) => {
                  const changesForDay = getChangesForDay(day);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        min-h-[100px] p-2 border rounded-lg
                        ${!isSameMonth(day, currentDate) ? "bg-muted/50" : "bg-background"}
                        ${isToday ? "border-primary border-2" : ""}
                      `}
                    >
                      <div className="text-sm font-semibold mb-2">
                        {format(day, "d")}
                      </div>
                      <div className="space-y-1">
                        {changesForDay.map((change) => (
                          <div
                            key={change.id}
                            className="text-xs p-1 bg-primary/10 rounded cursor-pointer hover:bg-primary/20"
                            title={change.title}
                          >
                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                              {change.change_number}
                            </Badge>
                            <p className="truncate mt-1">{change.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
