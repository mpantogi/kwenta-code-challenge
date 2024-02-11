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
  margin: 20px 40px 40px 40px;
`;

const Title = styled.h1`
  font-family: Arial, sans-serif;
  font-weight: 700;
  font-size: 15px;
  margin: 40px 40px 0px 40px;
`;

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      setIsLoading(true);
      setError(null);
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
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching markets:", error);
        setError("Failed to fetch market data");
        setIsLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  return (
    <>
      <Title>Synthetix Perps Markets</Title>
      <Main>
        <MarketsList markets={markets} isLoading={isLoading} error={error} />
      </Main>
    </>
  );
}
