
import React from "react";
import { formatEmotion } from "../components/EmotionDisplay";
import {
  Line,
  Doughnut,
  Bar,
  Radar
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const moodIndexMap = {
  angry: 1,
  disgust: 2,
  fear: 3,
  happy: 4,
  neutral: 5,
  sad: 6,
  surprise: 7,
};

const moodEmojiMap = {
  angry: "😡",
  disgust: "🤢",
  fear: "😨",
  happy: "😄",
  neutral: "😐",
  sad: "😢",
  surprise: "😲",
  "no-face": "👤"
};

const neonColors = [
  "#8b5cf6",
  "#1db954",
  "#00eaff",
  "#ff4b4b",
  "#facc15",
  "#a855f7",
  "#ff7b00",
];

// const tooltipMoodFormatter = (tooltipItem, labels) => {
//   const labelIndex = tooltipItem.dataIndex;
//   const mood = labels[labelIndex];
//   const emoji = moodEmojiMap[mood] || "";
//   return `${emoji} ${formatEmotion(mood)}`;
// };

function MoodCharts({ analyticsData }) {
  const timelineLabels = analyticsData.timeline.map((i) => i.date);
  const timelineMoods = analyticsData.timeline.map((i) => i.mood);

  const distributionLabels = Object.keys(analyticsData.distribution);
  const distributionValues = Object.values(analyticsData.distribution);

  const timelineNumerical = timelineMoods.map(
    (m) => moodIndexMap[m] || 0
  );

  return (
    <div className="gs-charts-container">

      {/* -------------------- LINE CHART -------------------- */}
      <div className="chart-box gs-card">
        <h3>📈 Mood Timeline</h3>
        <Line
          data={{
            labels: timelineLabels,
            datasets: [
              {
                label: "Mood Trend",
                data: timelineNumerical,
                borderColor: "#00eaff",
                backgroundColor: "rgba(0, 234, 255, 0.25)",
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: "#1db954",
                fill: true,
              },
            ],
          }}
          options={{
            animation: {
              duration: 1200,
              easing: "easeInOutQuart",
            },
            responsive: true,

            plugins: {
              tooltip: {
                callbacks: {
                  label: function (ctx) {
                    const mood = timelineMoods[ctx.dataIndex];
                    const emoji = moodEmojiMap[mood];
                    return `${emoji} ${formatEmotion(mood)}`;
                  },
                },
              },
            },

            scales: {
              y: {
                min: 0,
                max: 7,
                ticks: {
                  stepSize: 1,
                  callback: function (value) {
                    return Object.entries(moodIndexMap).find(
                      ([key, index]) => index === value
                    )?.[0] || "";
                  },
                },
              },
            },
          }}
        />
      </div>

      {/* -------------------- DOUGHNUT CHART -------------------- */}
      <div className="chart-box gs-card">
        <h3>🍩 Mood Distribution</h3>
        <Doughnut
          data={{
            labels: distributionLabels,
            datasets: [
              {
                data: distributionValues,
                backgroundColor: neonColors,
              },
            ],
          }}
          options={{
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 1200,
              easing: "easeOutBounce",
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (ctx) {
                    const mood = distributionLabels[ctx.dataIndex];
                    const emoji = moodEmojiMap[mood];
                    const val = distributionValues[ctx.dataIndex];
                    return `${emoji} ${formatEmotion(mood)}: ${val}`;
                  },
                },
              },
            },
          }}
        />
      </div>

      {/* -------------------- BAR CHART -------------------- */}
      <div className="chart-box gs-card">
        <h3>📊 Weekly Mood Frequency</h3>

        <Bar
          data={{
            labels: distributionLabels,
            datasets: [
              {
                label: "Count",
                data: distributionValues,
                backgroundColor: neonColors,
                borderWidth: 2,
              },
            ],
          }}
          options={{
            animation: {
              duration: 1400,
              easing: "easeOutCubic",
            },

            scales: {
              x: {
                ticks: {
                  callback: function (value, index) {
                    const mood = distributionLabels[index];
                    return moodEmojiMap[mood] || "❓";
                  },
                  font: { size: 20 },
                  maxRotation: 0,
                  minRotation: 0, 
                },
              },
              y: {
                ticks: {
                  font: { size: 14 },
                },
              },
            },

            plugins: {
              tooltip: {
                callbacks: {
                  label: function (ctx) {
                    const mood = distributionLabels[ctx.dataIndex];
                    const emoji = moodEmojiMap[mood];
                    return `${emoji} ${formatEmotion(mood)}: ${ctx.raw}`;
                  },
                },
              },
            },
          }}
        />
      </div>

      {/* -------------------- RADAR CHART -------------------- */}
      <div className="chart-box gs-card">
        <h3>🎯 Mood Intensity (Radar)</h3>
        <Radar
          data={{
            labels: distributionLabels,
            datasets: [
              {
                label: "Mood Intensity",
                data: distributionValues,
                backgroundColor: "rgba(139,92,246,0.35)",
                borderColor: "#8b5cf6",
                pointBackgroundColor: "#1db954",
              },
            ],
          }}
          options={{
            animation: {
              duration: 1500,
              easing: "easeInOutSine",
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (ctx) {
                    const mood = distributionLabels[ctx.dataIndex];
                    const emoji = moodEmojiMap[mood];
                    return `${emoji} ${formatEmotion(mood)}: ${ctx.raw}`;
                  },
                },
              },
            },
          }}
        />
      </div>

    </div>
  );
}

export default MoodCharts;
