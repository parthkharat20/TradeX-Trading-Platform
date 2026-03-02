import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  TrendingUp,
  TrendingDown,
  Timeline,
  PieChart,
  BarChart,
  Download,
  Refresh,
} from "@mui/icons-material";
import "./Portfolio.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("1M"); // 1D, 1W, 1M, 3M, 1Y, ALL
  const [chartType, setChartType] = useState("line"); // line, bar, pie

  useEffect(() => {
    fetchPortfolioData();
  }, [timeframe]);

  const fetchPortfolioData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [statsRes, holdingsRes] = await Promise.all([
        axios.get("http://localhost:3002/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3002/allHoldings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPortfolioData({
        stats: statsRes.data,
        holdings: holdingsRes.data,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };

  // Mock performance data (replace with real API)
  const generatePerformanceData = () => {
    const labels = [];
    const data = [];
    const baseValue = 100000;

    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }));
      data.push(baseValue + Math.random() * 15000 - 5000);
    }

    return { labels, data };
  };

  const performanceData = generatePerformanceData();

  // Line Chart Data
  const lineChartData = {
    labels: performanceData.labels,
    datasets: [
      {
        label: "Portfolio Value",
        data: performanceData.data,
        borderColor: "rgb(65, 132, 243)",
        backgroundColor: "rgba(65, 132, 243, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgb(65, 132, 243)",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Sector Distribution Pie Chart
  const sectorData = {
    labels: ["Technology", "Banking", "Energy", "Healthcare", "Consumer"],
    datasets: [
      {
        data: [35, 25, 15, 15, 10],
        backgroundColor: [
          "rgba(65, 132, 243, 0.8)",
          "rgba(72, 194, 55, 0.8)",
          "rgba(255, 159, 64, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 99, 132, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  // Top Holdings Bar Chart
  const topHoldingsData = {
    labels: portfolioData?.holdings.slice(0, 5).map((h) => h.name) || [],
    datasets: [
      {
        label: "Investment Value (₹)",
        data: portfolioData?.holdings.slice(0, 5).map((h) => h.avg * h.qty) || [],
        backgroundColor: "rgba(65, 132, 243, 0.8)",
        borderRadius: 6,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="portfolio-loading">
        <div className="loading-spinner"></div>
        <p>Loading portfolio analytics...</p>
      </div>
    );
  }

  const stats = portfolioData?.stats;

  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <h2>Portfolio Analytics</h2>
        <div className="header-actions">
          <button className="btn btn-grey" onClick={fetchPortfolioData}>
            <Refresh style={{ fontSize: "1rem" }} />
            Refresh
          </button>
          <button className="btn btn-blue">
            <Download style={{ fontSize: "1rem" }} />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: "rgba(65, 132, 243, 0.1)" }}>
            💰
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Value</span>
            <span className="metric-value">
              ₹{stats?.totalCurrentValue?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: "rgba(72, 194, 55, 0.1)" }}>
            <TrendingUp style={{ color: "rgb(72, 194, 55)" }} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total P&L</span>
            <span
              className={`metric-value ${
                stats?.totalPnL >= 0 ? "profit" : "loss"
              }`}
            >
              {stats?.totalPnL >= 0 ? "+" : ""}₹{stats?.totalPnL?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: "rgba(255, 159, 64, 0.1)" }}>
            📊
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Investment</span>
            <span className="metric-value">
              ₹{stats?.totalInvestment?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: "rgba(153, 102, 255, 0.1)" }}>
            📈
          </div>
          <div className="metric-info">
            <span className="metric-label">Returns</span>
            <span
              className={`metric-value ${
                stats?.totalPnLPercent >= 0 ? "profit" : "loss"
              }`}
            >
              {stats?.totalPnLPercent >= 0 ? "+" : ""}
              {stats?.totalPnLPercent || "0.00"}%
            </span>
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="timeframe-selector">
        {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((tf) => (
          <button
            key={tf}
            className={timeframe === tf ? "tf-btn active" : "tf-btn"}
            onClick={() => setTimeframe(tf)}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="chart-section">
        <div className="chart-header">
          <h3>
            <Timeline style={{ fontSize: "1.2rem" }} />
            Portfolio Performance
          </h3>
          <div className="chart-type-selector">
            <button
              className={chartType === "line" ? "active" : ""}
              onClick={() => setChartType("line")}
            >
              Line
            </button>
            <button
              className={chartType === "bar" ? "active" : ""}
              onClick={() => setChartType("bar")}
            >
              Bar
            </button>
          </div>
        </div>
        <div className="chart-container">
          {chartType === "line" ? (
            <Line data={lineChartData} options={lineChartOptions} />
          ) : (
            <Bar data={lineChartData} options={barChartOptions} />
          )}
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="secondary-charts">
        <div className="chart-section">
          <div className="chart-header">
            <h3>
              <PieChart style={{ fontSize: "1.2rem" }} />
              Sector Distribution
            </h3>
          </div>
          <div className="chart-container small">
            <Pie data={sectorData} options={pieChartOptions} />
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-header">
            <h3>
              <BarChart style={{ fontSize: "1.2rem" }} />
              Top Holdings
            </h3>
          </div>
          <div className="chart-container small">
            <Bar data={topHoldingsData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="performance-summary">
        <h3>Performance Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Best Performer</span>
            <span className="summary-value profit">
              {stats?.topGainers?.[0]?.name || "N/A"} (+
              {stats?.topGainers?.[0]?.pnlPercent?.toFixed(2) || "0"}%)
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Worst Performer</span>
            <span className="summary-value loss">
              {stats?.topLosers?.[0]?.name || "N/A"} (
              {stats?.topLosers?.[0]?.pnlPercent?.toFixed(2) || "0"}%)
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Stocks</span>
            <span className="summary-value">{stats?.holdingsCount || 0}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Avg. Holding Period</span>
            <span className="summary-value">45 days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;