import React from "react";
import { Route, Routes } from "react-router-dom";

import Apps from "./Apps";
import Funds from "./Funds";
import Holdings from "./Holdings";
import Orders from "./Orders";
import Positions from "./Positions";
import Summary from "./Summary";
import Alerts from "./Alerts";
import WatchList from "./WatchList";
import Profile from "./Profile";
import Settings from "./Settings";
import MarketNews from "./MarketNews";
import Portfolio from "./Portfolio";
import Reports from "./Reports";
import StockCompare from "./StockCompare";
import TradeCalculator from "./TradeCalculator";
import TradingJournal from "./TradingJournal";
import QuickActions from "./QuickActions";
import { GeneralContextProvider } from "./GeneralContext";

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <GeneralContextProvider>
        <WatchList />
        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={<Summary />} />
            <Route path="orders" element={<Orders />} />
            <Route path="holdings" element={<Holdings />} />
            <Route path="positions" element={<Positions />} />
            <Route path="funds" element={<Funds />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="apps" element={<Apps />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="news" element={<MarketNews />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="reports" element={<Reports />} />
            <Route path="compare" element={<StockCompare />} />
            <Route path="calculator" element={<TradeCalculator />} />
            <Route path="journal" element={<TradingJournal />} />
          </Routes>
        </div>

        {/* Quick Actions FAB */}
        <QuickActions />
      </GeneralContextProvider>
    </div>
  );
};

export default Dashboard;