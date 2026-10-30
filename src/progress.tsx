// Live progress numbers for the screens: today's summary (not yet in history), the streak,
// missed day, PRs (history + today) and the light week. All derived; nothing stored here.
import { useMemo } from "react";
import { previousDates, summarizeDay, weekdayOf } from "./logic/history";
import { addSessions, prList, sessionsFromTicks } from "./logic/lifts";
import { isLightWeek, missedYesterday, streak, weekNumber } from "./logic/streak";
import { walkMinutes } from "./logic/activity";
import { useStore } from "./store";

export function useProgress() {
  const { today, plan, ticks, kg, swaps, setups, stretchSetups, water, prefs, history, lifts, walks, steps } = useStore();
  return useMemo(() => {
    const day = plan.find((d) => d.key === weekdayOf(today))!;
    const todaySessions = sessionsFromTicks({ date: today, days: plan, ticks, kg, swaps, setups });
    const allLifts = addSessions(lifts, todaySessions);
    const prs = prList(allLifts);
    const todaySummary = {
      ...summarizeDay({ date: today, day, ticks, water, setups, stretchSetups, baseWaterMl: prefs.water.baseGoalMl }),
      prs: prs.filter((p) => p.date === today).length,
      walkMin: walks.reduce((a, w) => a + walkMinutes(w), 0),
      steps: steps ?? 0,
    };
    const startDate = prefs.startDate ?? today;
    const [yesterday] = previousDates(today, 1);
    const week = weekNumber(startDate, today);
    return {
      today, day, todaySummary, todaySessions, allLifts, prs,
      streak: streak({ history, plan, today, todaySummary, startDate }),
      missedYesterday: missedYesterday(history, plan, today, startDate),
      prYesterday: (history[yesterday]?.prs ?? 0) > 0,
      week, lightWeek: isLightWeek(week) && prefs.lightWeekSeen !== week,
    };
  }, [today, plan, ticks, kg, swaps, setups, stretchSetups, water, prefs.water.baseGoalMl, prefs.startDate, prefs.lightWeekSeen, history, lifts, walks, steps]);
}
