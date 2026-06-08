import type { WritingTask } from "@/modules/writing/types";
import { WritingTaskPromptHeader } from "@/modules/writing/components/writing-task-prompt-header";
import {
  WritingTask1Chart,
  WritingTask1LineChart,
} from "@/modules/writing/components/writing-task1-chart";
import type { WritingChartSpec } from "@/modules/writing/types";

type Props = {
  task: WritingTask;
  minutes?: number;
  minWords?: number;
};

function parseChartSpec(value: unknown): WritingChartSpec | null {
  if (!value) return null;
  const raw =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value) as unknown;
          } catch {
            return null;
          }
        })()
      : value;
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Partial<WritingChartSpec> & {
    labels?: unknown;
    datasets?: unknown;
    data?: unknown;
  };
  const parsedSeries: WritingChartSpec["series"] = Array.isArray(candidate.series)
    ? candidate.series.flatMap((s) => {
        if (!s || typeof s !== "object") return [];
        const row = s as { mode?: unknown; values?: unknown; label?: unknown; data?: unknown };
        const mode = typeof row.mode === "string" ? row.mode : undefined;
        const label = typeof row.label === "string" ? row.label : undefined;
        const values = Array.isArray(row.values)
          ? row.values
          : Array.isArray(row.data)
            ? row.data
            : null;
        if ((!mode && !label) || !values) return [];
        return [
          {
            mode,
            label,
            values: values.map((v) => Number(v) || 0),
          },
        ];
      })
    : [];

  if (Array.isArray(candidate.labels) && parsedSeries.length) {
    return {
      type: candidate.type,
      title: candidate.title,
      source: candidate.source,
      y_max: candidate.y_max,
      y_unit: typeof candidate.y_unit === "string" ? candidate.y_unit : undefined,
      labels: candidate.labels.filter((l): l is string => typeof l === "string"),
      series: parsedSeries,
    };
  }

  if (Array.isArray(candidate.cities) && parsedSeries.length) {
    return {
      type: candidate.type,
      title: candidate.title,
      source: candidate.source,
      y_max: candidate.y_max,
      cities: candidate.cities.filter((c): c is string => typeof c === "string"),
      series: parsedSeries,
    };
  }
  if (Array.isArray(candidate.labels) && Array.isArray(candidate.datasets)) {
    const cities = candidate.labels.filter((c): c is string => typeof c === "string");
    const series = candidate.datasets
      .map((d) => {
        if (!d || typeof d !== "object") return null;
        const row = d as { mode?: unknown; label?: unknown; values?: unknown; data?: unknown };
        const mode = typeof row.mode === "string" ? row.mode : typeof row.label === "string" ? row.label : null;
        const values = Array.isArray(row.values)
          ? row.values
          : Array.isArray(row.data)
            ? row.data
            : null;
        if (!mode || !values) return null;
        return {
          mode,
          values: values.map((v) => Number(v) || 0),
        };
      })
      .filter((s): s is { mode: string; values: number[] } => s !== null);
    if (cities.length && series.length) {
      return {
        type: candidate.type,
        title: candidate.title,
        source: candidate.source,
        y_max: candidate.y_max,
        cities,
        series,
      };
    }
  }
  return null;
}

function normalizeRepeatedPrompt(raw: string): string {
  const trimmed = raw.trim();
  const lines = trimmed.split("\n").map((line) => line.trim());
  const nonEmpty = lines.filter(Boolean);
  if (nonEmpty.length < 4 || nonEmpty.length % 2 !== 0) return trimmed;
  const half = nonEmpty.length / 2;
  const firstHalf = nonEmpty.slice(0, half).join("\n");
  const secondHalf = nonEmpty.slice(half).join("\n");
  return firstHalf === secondHalf ? nonEmpty.slice(0, half).join("\n\n") : trimmed;
}

function splitTask1Prompt(raw: string): { beforeChart: string; afterChart: string } {
  const normalized = normalizeRepeatedPrompt(raw);
  const idx = normalized.search(/\n\nSummarise /i);
  if (idx < 0) {
    return { beforeChart: normalized.trim(), afterChart: "" };
  }
  return {
    beforeChart: normalized.slice(0, idx).trim(),
    afterChart: normalized.slice(idx).trim(),
  };
}

export function WritingTask1Prompt({
  task,
  minutes = 20,
  minWords = 150,
}: Props) {
  const chart =
    parseChartSpec(task.options?.chart) ??
    parseChartSpec((task.options as Record<string, unknown> | undefined)?.chart_data) ??
    parseChartSpec((task.options as Record<string, unknown> | undefined)?.figure);
  const figureLabel = task.options?.figure_label ?? "Figure 1";
  const figureNote =
    task.options?.figure_note ??
    "[Grouped bar chart — four cities on x-axis; percentage on y-axis; four transport modes shown per city]";
  const { beforeChart, afterChart } = splitTask1Prompt(task.prompt);

  const isLineGraph =
    chart?.type === "line_graph" ||
    (Boolean(chart?.labels?.length) && !chart?.cities?.length);

  const chartBlock =
    task.options?.image_url ? (
      <img
        src={task.options.image_url}
        alt="Task 1 visual"
        className="max-w-full rounded-lg border border-border"
      />
    ) : chart && isLineGraph ? (
      <WritingTask1LineChart
        chart={chart}
        figureLabel={figureLabel}
        figureNote={figureNote}
      />
    ) : chart?.cities?.length ? (
      <WritingTask1Chart
        chart={chart}
        figureLabel={figureLabel}
        figureNote={figureNote}
      />
    ) : (
      <p className="text-meta text-ink/50">
        Chart image will appear here when available.
      </p>
    );

  return (
    <div className="space-y-4">
      <WritingTaskPromptHeader
        part={1}
        options={task.options}
        minutes={minutes}
        minWords={minWords}
      />

      {beforeChart ? (
        <p className="text-question leading-relaxed text-ink">{beforeChart}</p>
      ) : null}

      <div data-test-question>{chartBlock}</div>

      {afterChart ? (
        <p className="text-question leading-relaxed text-ink">{afterChart}</p>
      ) : null}

      {!beforeChart && !afterChart ? (
        <p className="text-question leading-relaxed text-ink" data-test-question>
          {task.prompt}
        </p>
      ) : null}

    </div>
  );
}
