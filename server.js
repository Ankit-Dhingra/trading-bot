const express = require('express');
const app = express();
const dotenv = require('dotenv');
const axios = require('axios'); 
const moment = require('moment');
const fs = require('fs'); 

dotenv.config();
const port = process.env.PORT || 8080;

// Alpha Vantage API configuration
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const STOCK_SYMBOL = process.env.STOCK_SYMBOL || 'RELIANCE.BSE';
const CURRENCY = process.env.CURRENCY || 'INR'; 


let balance = 100000; 
let stockQuantity = 0; 
let profitLoss = 0; 
const movingAveragePeriod = 3; 
let stockPrices = []; 

async function fetchStockPrice() {
    try {
        const response = await axios.get(`https://www.alphavantage.co/query`, {
            params: {
                function: 'TIME_SERIES_DAILY',
                symbol: STOCK_SYMBOL,
                outputsize: 'compact', 
                apikey: ALPHA_VANTAGE_API_KEY
            }
        });

        const timeSeries = response.data['Time Series (Daily)'];
        const prices = Object.values(timeSeries).map(entry => parseFloat(entry['1. open']));
        stockPrices = prices.slice(0, 10);
        return stockPrices;
    } catch (error) {
        console.error('Error fetching stock price:', error);
        return [];
    }
}


function calculateMovingAverage(prices, period) {
    if (prices.length < period) return null;
    const sum = prices.slice(0, period).reduce((acc, price) => acc + price, 0);
    return sum / period;
}

function logTradeToFile(type, quantity, price) {
    const trade = {
        type,
        quantity,
        price,
        date: moment().format('YYYY-MM-DD HH:mm:ss')
    };
    let tradeLogs = [];
    try {
        if (fs.existsSync('trade_log.json')) {
            const data = fs.readFileSync('trade_log.json', 'utf8');
            tradeLogs = JSON.parse(data);
            console.log("Successfully read existing log file.");
        } else {
            console.log("Log file does not exist. Creating a new one.");
        }
    } catch (err) {
        console.error('Error reading log file:', err);
    }

    tradeLogs.push(trade);
    try {
        fs.writeFileSync('trade_log.json', JSON.stringify(tradeLogs, null, 2));
        console.log(`Logged ${type} trade: ${quantity} stocks at ₹${price}`);
    } catch (writeErr) {
        console.error('Error writing to log file:', writeErr);
    }
}

function executeTrade(currentPrice, movingAverage) {
    if (!movingAverage) return; 
    if (stockQuantity === 0 && currentPrice > movingAverage) {
        const buyAmount = Math.floor(balance / currentPrice);
        balance -= buyAmount * currentPrice;
        stockQuantity = buyAmount;
        logTradeToFile('buy', buyAmount, currentPrice); 
    }

    else if (stockQuantity > 0 && currentPrice < movingAverage) {
        const sellAmount = stockQuantity;
        balance += sellAmount * currentPrice;
        stockQuantity = 0;
        logTradeToFile('sell', sellAmount, currentPrice);
    }
}


function trackProfitLoss(currentPrice) {
    profitLoss = balance + stockQuantity * currentPrice - 100000; 
    console.log(`Balance: ₹${balance}, Profit/Loss: ₹${profitLoss}`);
}


app.get('/trade', async (req, res) => {
    const prices = await fetchStockPrice();
    
    if (prices && prices.length > 0) {
        const currentPrice = prices[0]; 
        const movingAverage = calculateMovingAverage(prices, movingAveragePeriod);
        console.log(`Current Price: ₹${currentPrice}, Moving Average: ₹${movingAverage}`);
        executeTrade(currentPrice, movingAverage);
        trackProfitLoss(currentPrice);
        res.json({
            currentPrice,
            balance,
            profitLoss,
            stockQuantity,
            tradeLogFile: 'trade_log.json'
        });
    } else {
        res.status(500).send('Error fetching stock prices.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Trading bot running on http://localhost:${port}`);
});