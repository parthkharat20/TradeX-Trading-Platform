import React, { useState, useContext, useEffect } from "react";
import GeneralContext from "./GeneralContext";
import axios from "axios";
import { Tooltip, Grow } from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Add,
  Close,
  StarBorder,
  Star,
  TrendingUp,
  TrendingDown,
  ShowChart,
  Refresh,
  FilterList,
  Search,
} from "@mui/icons-material";
import { watchlist } from "../data/data";
import LiveIndicator from "./LiveIndicator";
import { updateAllPrices } from "../utils/priceSimulator";
import "./WatchList.css";

const WatchList = () => {
  const [stocks, setStocks] = useState(watchlist);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [favorites, setFavorites] = useState([]);
  const [portfolioData, setPortfolioData] = useState(null);
  const [marketMovers, setMarketMovers] = useState({ gainers: [], losers: [] });

  useEffect(() => {
    fetchPortfolioSummary();
    if (!isLive) return;

    const interval = setInterval(() => {
      setStocks(prevStocks => {
        const updated = updateAllPrices(prevStocks);
        setLastUpdated(new Date());
        updateMarketMovers(updated);
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const fetchPortfolioSummary = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [fundsRes, statsRes] = await Promise.all([
        axios.get("http://localhost:3002/funds", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3002/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPortfolioData({
        funds: fundsRes.data,
        stats: statsRes.data,
      });
    } catch (err) {
      console.error("Error fetching portfolio:", err);
    }
  };

  const updateMarketMovers = (stockList) => {
    const sorted = [...stockList].sort((a, b) => 
      parseFloat(b.percent) - parseFloat(a.percent)
    );
    setMarketMovers({
      gainers: sorted.slice(0, 3),
      losers: sorted.slice(-3).reverse(),
    });
  };

  const toggleLive = () => {
    setIsLive(prev => !prev);
  };

  const toggleFavorite = (stockName) => {
    setFavorites(prev => 
      prev.includes(stockName)
        ? prev.filter(name => name !== stockName)
        : [...prev, stockName]
    );
  };

  const getFilteredStocks = () => {
    let filtered = stocks;

    if (searchQuery) {
      filtered = filtered.filter(stock =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const sorted = [...filtered];
    if (sortBy === "gainers") {
      sorted.sort((a, b) => parseFloat(b.percent) - parseFloat(a.percent));
    } else if (sortBy === "losers") {
      sorted.sort((a, b) => parseFloat(a.percent) - parseFloat(b.percent));
    } else if (sortBy === "volume") {
      sorted.sort((a, b) => b.price - a.price); // Mock volume sort
    }

    return sorted;
  };

  const filteredStocks = getFilteredStocks();

  const marketStats = {
    gainers: stocks.filter(s => !s.isDown).length,
    losers: stocks.filter(s => s.isDown).length,
    totalVolume: stocks.reduce((sum, s) => sum + s.price, 0).toFixed(2),
  };

  return (
    <div className="watchlist-container">
      {/* Portfolio Quick View */}
      {portfolioData && (
        <div className="portfolio-quick-view">
          <div className="portfolio-item">
            <span className="portfolio-label">Portfolio</span>
            <span className="portfolio-value">
              ₹{portfolioData.stats.totalCurrentValue?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className={`portfolio-item ${portfolioData.stats.totalPnL >= 0 ? 'profit' : 'loss'}`}>
            <span className="portfolio-label">P&L</span>
            <span className="portfolio-value">
              {portfolioData.stats.totalPnL >= 0 ? '+' : ''}
              ₹{portfolioData.stats.totalPnL?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="portfolio-item">
            <span className="portfolio-label">Holdings</span>
            <span className="portfolio-value">
              {portfolioData.stats.holdingsCount || 0}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="watchlist-header">
        <h3 className="watchlist-title">Watchlist</h3>
        <div className="header-actions">
          <button 
            onClick={() => fetchPortfolioSummary()}
            className="icon-btn"
            title="Refresh"
          >
            <Refresh style={{ fontSize: '1rem' }} />
          </button>
          <span className="stock-count">{stocks.length}/50</span>
        </div>
      </div>

      {/* Search */}
      <div className="search-container">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Search stocks..."
          className="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-search" onClick={() => setSearchQuery("")}>
            <Close style={{ fontSize: '1rem' }} />
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="watchlist-controls">
        <LiveIndicator isActive={isLive} lastUpdated={lastUpdated} />
        <div className="control-btns">
          <button 
            onClick={toggleLive}
            className={`control-btn ${!isLive ? 'paused' : ''}`}
          >
            {isLive ? '⏸' : '▶'}
          </button>
          <button className="control-btn">
            <FilterList style={{ fontSize: '1rem' }} />
          </button>
        </div>
      </div>

      {/* Market Stats */}
      <div className="market-stats">
        <div className="stat-box gainers">
          <TrendingUp style={{ fontSize: '1rem' }} />
          <div>
            <span className="stat-value">{marketStats.gainers}</span>
            <span className="stat-label">Gainers</span>
          </div>
        </div>
        <div className="stat-box losers">
          <TrendingDown style={{ fontSize: '1rem' }} />
          <div>
            <span className="stat-value">{marketStats.losers}</span>
            <span className="stat-label">Losers</span>
          </div>
        </div>
        <div className="stat-box volume">
          <ShowChart style={{ fontSize: '1rem' }} />
          <div>
            <span className="stat-value">₹{marketStats.totalVolume}K</span>
            <span className="stat-label">Volume</span>
          </div>
        </div>
      </div>

      {/* Sort Tabs */}
      <div className="sort-tabs">
        <button
          className={sortBy === "name" ? "tab active" : "tab"}
          onClick={() => setSortBy("name")}
        >
          All
        </button>
        <button
          className={sortBy === "gainers" ? "tab active" : "tab"}
          onClick={() => setSortBy("gainers")}
        >
          Gainers
        </button>
        <button
          className={sortBy === "losers" ? "tab active" : "tab"}
          onClick={() => setSortBy("losers")}
        >
          Losers
        </button>
      </div>

      {/* Stock List */}
      <ul className="stock-list">
        {filteredStocks.map((stock, index) => (
          <WatchListItem 
            stock={stock} 
            key={index}
            isFavorite={favorites.includes(stock.name)}
            toggleFavorite={toggleFavorite}
          />
        ))}
      </ul>

      {filteredStocks.length === 0 && (
        <div className="no-results">
          <p>No stocks found</p>
        </div>
      )}

      {/* Market Movers */}
      <div className="market-movers">
        <div className="movers-section">
          <h4>🔥 Top Gainers</h4>
          {marketMovers.gainers.map((stock, i) => (
            <div key={i} className="mover-item">
              <span className="mover-name">{stock.name}</span>
              <span className="mover-change up">+{stock.percent}%</span>
            </div>
          ))}
        </div>
        <div className="movers-section">
          <h4>📉 Top Losers</h4>
          {marketMovers.losers.map((stock, i) => (
            <div key={i} className="mover-item">
              <span className="mover-name">{stock.name}</span>
              <span className="mover-change down">{stock.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="quick-tips">
        <h4>💡 Trading Tip</h4>
        <p>Always set stop-loss orders to manage risk effectively.</p>
      </div>
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, isFavorite, toggleFavorite }) => {
  const [showActions, setShowActions] = useState(false);
  const [flashClass, setFlashClass] = useState('');
  const [prevPrice, setPrevPrice] = useState(stock.price);

  useEffect(() => {
    if (stock.price !== prevPrice) {
      const direction = stock.price > prevPrice ? 'up' : 'down';
      setFlashClass(`flash-${direction}`);
      setPrevPrice(stock.price);
      
      const timer = setTimeout(() => setFlashClass(''), 600);
      return () => clearTimeout(timer);
    }
  }, [stock.price, prevPrice]);

  const priceChange = parseFloat(stock.percent);
  const isPositive = priceChange >= 0;

  return (
    <li 
      onMouseEnter={() => setShowActions(true)} 
      onMouseLeave={() => setShowActions(false)}
      className={`stock-item ${flashClass}`}
    >
      <div className="stock-content">
        <div className="stock-left">
          <button 
            className="favorite-btn"
            onClick={() => toggleFavorite(stock.name)}
          >
            {isFavorite ? (
              <Star style={{ fontSize: '0.9rem', color: '#f9a825' }} />
            ) : (
              <StarBorder style={{ fontSize: '0.9rem' }} />
            )}
          </button>
          <div className="stock-info">
            <p className="stock-name">{stock.name}</p>
            <p className="stock-exchange">NSE</p>
          </div>
        </div>

        <div className="stock-right">
          <p className={`stock-price ${isPositive ? 'up' : 'down'}`}>
            ₹{stock.price.toFixed(2)}
          </p>
          <div className={`stock-change ${isPositive ? 'up' : 'down'}`}>
            {isPositive ? (
              <KeyboardArrowUp style={{ fontSize: '0.8rem' }} />
            ) : (
              <KeyboardArrowDown style={{ fontSize: '0.8rem' }} />
            )}
            <span>{Math.abs(priceChange).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {showActions && <WatchListActions uid={stock.name} />}
    </li>
  );
};

const WatchListActions = ({ uid }) => {
  const generalContext = useContext(GeneralContext);

  return (
    <div className="stock-actions">
      <Tooltip title="Buy" placement="top" arrow>
        <button 
          className="action-btn buy-btn" 
          onClick={() => generalContext.openBuyWindow(uid)}
        >
          B
        </button>
      </Tooltip>
      <Tooltip title="Sell" placement="top" arrow>
        <button 
          className="action-btn sell-btn" 
          onClick={() => generalContext.openSellWindow(uid)}
        >
          S
        </button>
      </Tooltip>
      <Tooltip title="Chart" placement="top" arrow>
        <button className="action-btn chart-btn">
          📊
        </button>
      </Tooltip>
    </div>
  );
};