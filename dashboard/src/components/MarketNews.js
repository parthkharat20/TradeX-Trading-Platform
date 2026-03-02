import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Public,
  FilterList,
  Refresh,
  Bookmark,
  BookmarkBorder,
  Share,
} from "@mui/icons-material";
import "./MarketNews.css";

const MarketNews = () => {
  const [news, setNews] = useState([]);
  const [filter, setFilter] = useState("all"); // all, market, stocks, economy
  const [savedArticles, setSavedArticles] = useState([]);

  useEffect(() => {
    fetchNews();
  }, [filter]);

  const fetchNews = () => {
    // Mock news data (replace with real API)
    const mockNews = [
      {
        id: 1,
        title: "NIFTY 50 Hits New All-Time High at 24,500",
        excerpt:
          "Indian benchmark index NIFTY 50 closed at record high driven by strong buying in IT and banking stocks...",
        category: "market",
        source: "Economic Times",
        time: "2 hours ago",
        sentiment: "positive",
        image: "📈",
      },
      {
        id: 2,
        title: "RBI Announces Quarterly Monetary Policy Review",
        excerpt:
          "Reserve Bank of India keeps repo rate unchanged at 6.50%, focuses on inflation control measures...",
        category: "economy",
        source: "Bloomberg",
        time: "4 hours ago",
        sentiment: "neutral",
        image: "🏦",
      },
      {
        id: 3,
        title: "TCS Q4 Results Beat Estimates, Stock Surges 5%",
        excerpt:
          "Tata Consultancy Services reports strong quarterly earnings with revenue growth of 14% YoY...",
        category: "stocks",
        source: "MoneyControl",
        time: "5 hours ago",
        sentiment: "positive",
        image: "💼",
      },
      {
        id: 4,
        title: "Global Markets Mixed as Fed Signals Rate Pause",
        excerpt:
          "US Federal Reserve hints at pausing interest rate hikes, Asian markets show mixed response...",
        category: "market",
        source: "Reuters",
        time: "6 hours ago",
        sentiment: "neutral",
        image: "🌍",
      },
      {
        id: 5,
        title: "Reliance Industries Announces New Green Energy Projects",
        excerpt:
          "Mukesh Ambani-led conglomerate plans ₹75,000 crore investment in renewable energy sector...",
        category: "stocks",
        source: "CNBC",
        time: "8 hours ago",
        sentiment: "positive",
        image: "⚡",
      },
    ];

    const filtered =
      filter === "all"
        ? mockNews
        : mockNews.filter((item) => item.category === filter);
    setNews(filtered);
  };

  const toggleSave = (articleId) => {
    setSavedArticles((prev) =>
      prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId]
    );
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp style={{ color: "rgb(72, 194, 55)" }} />;
      case "negative":
        return <TrendingDown style={{ color: "rgb(250, 118, 78)" }} />;
      default:
        return <Public style={{ color: "rgb(136, 136, 136)" }} />;
    }
  };

  return (
    <div className="market-news-page">
      <div className="news-header">
        <h2>Market News</h2>
        <button className="btn btn-blue" onClick={fetchNews}>
          <Refresh style={{ fontSize: "1rem" }} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="news-filters">
        <button
          className={filter === "all" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("all")}
        >
          All News
        </button>
        <button
          className={filter === "market" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("market")}
        >
          📊 Markets
        </button>
        <button
          className={filter === "stocks" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("stocks")}
        >
          💼 Stocks
        </button>
        <button
          className={filter === "economy" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("economy")}
        >
          🏦 Economy
        </button>
      </div>

      {/* Market Summary */}
      <div className="market-summary">
        <div className="summary-card positive">
          <h4>Most Active</h4>
          <p>RELIANCE: ₹2,456 (+2.3%)</p>
        </div>
        <div className="summary-card positive">
          <h4>Top Gainer</h4>
          <p>TCS: ₹3,678 (+5.1%)</p>
        </div>
        <div className="summary-card negative">
          <h4>Top Loser</h4>
          <p>HDFC: ₹1,543 (-1.8%)</p>
        </div>
      </div>

      {/* News Feed */}
      <div className="news-feed">
        {news.map((article) => (
          <div key={article.id} className="news-card">
            <div className="news-icon">{article.image}</div>
            <div className="news-content">
              <div className="news-meta">
                <span className="news-source">{article.source}</span>
                <span className="news-time">{article.time}</span>
                {getSentimentIcon(article.sentiment)}
              </div>
              <h3 className="news-title">{article.title}</h3>
              <p className="news-excerpt">{article.excerpt}</p>
              <div className="news-actions">
                <button className="news-action-btn">Read More</button>
                <button
                  className="news-action-btn"
                  onClick={() => toggleSave(article.id)}
                >
                  {savedArticles.includes(article.id) ? (
                    <Bookmark style={{ fontSize: "1rem" }} />
                  ) : (
                    <BookmarkBorder style={{ fontSize: "1rem" }} />
                  )}
                </button>
                <button className="news-action-btn">
                  <Share style={{ fontSize: "1rem" }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketNews;