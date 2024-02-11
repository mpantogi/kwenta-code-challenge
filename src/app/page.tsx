"use client";

import { useState, useEffect } from "react";
import { getPerpsMarkets } from "../services/ethereum";
import { MarketsList } from "../components/MarketsList";
import styled from "styled-components";

interface Market {
  name: string;
  size: string;
  price: string;
  makerFee: string;
  takerFee: string;
}
const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  overflow: auto;
  justify-content: center;
  height: 100vh;
  width: 100vw;
`;

const Title = styled.h1`
  font-family: Arial, sans-serif;
  font-weight: 700;
  font-size: 15px;
  margin: 20px 0;
  text-align: left;
`;

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const data = await getPerpsMarkets();
        console.log("data", data);
        // Map the fetched MarketData[] to Market[], ensuring proper conversion
        const mappedData: Market[] = data.map((marketData) => ({
          name: marketData.asset,
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

  return (
    <Main>
      <Title>Synthetix Perps Markets</Title>
      <MarketsList markets={markets} />
    </Main>
  );
}
