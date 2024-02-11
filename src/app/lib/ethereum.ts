import { ethers } from "ethers";

import perpsV2MarketDataAbi from "./PerpsV2MarketDataAbi.json";

const contractAddress: string =
  process.env.NEXT_PUBLIC_PERPS_V2_MARKET_DATA_ADDRESS || "";

interface FeeRates {
  takerFee: string;
  makerFee: string;
}

interface MarketData {
  market: string;
  asset: string; // Potentially used for the market name after conversion
  price: string;
  marketSize: string;
  feeRates: FeeRates;
}

// Function to fetch perps markets data
export const getPerpsMarkets = async (): Promise<MarketData[]> => {
  try {
    // Initialize the provider and contract
    const provider = new ethers.providers.JsonRpcProvider(
      "https://mainnet.optimism.io"
    );
    const contract = new ethers.Contract(
      contractAddress,
      perpsV2MarketDataAbi,
      provider
    );

    // Fetch all market summaries
    const data = await contract.allMarketSummaries();

    // Process the fetched data to match the MarketData interface
    const processedData: MarketData[] = data.map((market: any) => ({
      market: market.market,
      asset: ethers.utils.parseBytes32String(market.asset), // Convert bytes32 to string
      price: market.price.toString(), // Convert BigNumber to string
      marketSize: market.marketSize.toString(), // Convert BigNumber to string
      feeRates: {
        takerFee: market.feeRates.takerFee.toString(),
        makerFee: market.feeRates.makerFee.toString(),
      },
    }));

    return processedData;
  } catch (error) {
    console.error("Failed to fetch perps markets:", error);
    throw new Error("Failed to fetch market data");
  }
};
