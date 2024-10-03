# Stock Trading Bot

## Overview
This is a stock trading bot implemented in Node.js that uses the [Alpha Vantage API](https://www.alphavantage.co/) to fetch real-time stock prices for Indian stocks. The bot implements a simple trading strategy based on moving averages and logs trades to a JSON file.

## Trading Logic
- **Buy Strategy**: The bot will buy stocks when the current price crosses above the moving average.
- **Sell Strategy**: The bot will sell stocks when the current price crosses below the moving average.

## Trade Logs
All trades (buy/sell) are logged in `trade_log.json`, which includes the following information:
- Type of trade (buy/sell)
- Quantity of stocks traded
- Price at which the trade was executed
- Date and time of the trade

## Requirements
- Node.js
- npm 

## Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Ankit-Dhingra/trading-bot.git
   cd trading-bot

2. **Install the Dependencies**:
  `npm install`

3. **Start the Server**:
  `node server.js`


Once the server is running, you can access the trading bot by navigating to:
`http://localhost:8080/trade`



