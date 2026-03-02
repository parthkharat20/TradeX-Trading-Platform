// Real-time stock price simulator
// Simulates realistic price movements

export const updateStockPrice = (currentPrice) => {
    // Random change between -1.5% to +1.5%
    const changePercent = (Math.random() - 0.5) * 3;
    const changeAmount = currentPrice * (changePercent / 100);
    const newPrice = currentPrice + changeAmount;
    
    return Math.max(0.01, parseFloat(newPrice.toFixed(2)));
  };
  
  export const updateAllPrices = (stocks) => {
    return stocks.map(stock => {
      const oldPrice = stock.price;
      const newPrice = updateStockPrice(stock.price);
      
      return {
        ...stock,
        price: newPrice,
        percent: ((newPrice / stock.avg - 1) * 100).toFixed(2),
        isDown: newPrice < stock.avg,
        priceChanged: newPrice !== oldPrice,
        priceDirection: newPrice > oldPrice ? 'up' : (newPrice < oldPrice ? 'down' : 'same')
      };
    });
  };