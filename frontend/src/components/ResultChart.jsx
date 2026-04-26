import React, { memo, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [\"#F5B700\", \"#0B1F3A\", \"#10B981\", \"#EF4444\", \"#3B82F6\"];

const ResultChart = memo(({ position, type = \"bar\" }) => {
  if (!position || !position.candidates || position.candidates.length === 0) {
    return (
      <div className="w-full h-48 sm:h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500 text-sm sm:text-base">No data available</p>
      </div>
    );
  }

  const data = useMemo(
    () =>
      position.candidates.map((candidate) => ({
        name: candidate.name,
        votes: candidate.voteCount,
        percentage: parseFloat(candidate.percentage),
      })),
    [position.candidates]
  );

  const isMobile = typeof window !== \"undefined\" && window.innerWidth < 768;

  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
        <PieChart>
          <Pie
            data={data}
            cx=\"50%\"
            cy=\"50%\"
            labelLine={false}
            label={isMobile ? undefined : ({ name, votes }) => `${name}: ${votes}`}
            outerRadius={isMobile ? 80 : 100}
            fill=\"#8884d8\"
            dataKey=\"votes\"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Default to bar chart
  return (
    <ResponsiveContainer width=\"100%\" height={isMobile ? 250 : 300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 0,
          bottom: isMobile ? 60 : 80,
        }}
      >
        <CartesianGrid strokeDasharray=\"3 3\" />
        <XAxis
          dataKey=\"name\"
          angle={isMobile ? -45 : -45}
          textAnchor=\"end\"
          height={isMobile ? 60 : 80}
          tick={{ fontSize: isMobile ? 12 : 14 }}
        />
        <YAxis tick={{ fontSize: isMobile ? 12 : 14 }} />
        <Tooltip />
        <Bar dataKey=\"votes\" fill=\"#F5B700\" />
      </BarChart>
    </ResponsiveContainer>
  );
});

ResultChart.displayName = \"ResultChart\";

export default ResultChart;
