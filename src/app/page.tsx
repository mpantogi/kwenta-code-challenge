"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getPerpsMarkets } from "../app/lib/ethereum";
import styles from "./page.module.css";

interface Market {
  name: string;
  size: string; // Still strings, but represent BigNumber values
  price: string;
  makerFee: string;
  takerFee: string;
}

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const data = await getPerpsMarkets();
        console.log("data", data);
        // Map the fetched MarketData[] to Market[], ensuring proper conversion
        const mappedData: Market[] = data.map((marketData) => ({
          name: marketData.asset, // Assuming 'asset' should be mapped to 'name', adjust as needed
          size: marketData.marketSize,
          price: marketData.price,
          makerFee: marketData.feeRates.makerFee,
          takerFee: marketData.feeRates.takerFee,
        }));
        setMarkets(mappedData);
        console.log("mappedData", mappedData);
      } catch (error) {
        console.error("Error fetching markets:", error);
        throw new Error("Failed to fetch market data by keys");
      }
    };

    fetchMarkets();
  }, []);

  // Function to format string values for display. Assumes these strings are BigNumber values encoded as strings.
  const formatValue = (value: string, decimals = 18) => {
    return ethers.formatUnits(value, decimals);
  };

  return <main className={styles.main}>Hello World</main>;
}
