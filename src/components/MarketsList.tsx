import { ethers } from "ethers";
import styled from "styled-components";
import { useState, useEffect } from "react";
import fetchEthPrice from "../utils/fetchEthPrice";

const TableContainer = styled.div`
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  border: 1px solid #313131;
  border-radius: 5px;
  overflow-x: auto;
  display: block;
  min-width: fit-content;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  background-color: #313131;
  padding: 8px;
  position: sticky;
  top: 0;
  z-index: 1;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  @media (max-width: 560px) {
    gap: 8px;
    padding: 4px;
    grid-template-columns: 1fr 0.5fr 1fr 1fr;
    text-align: center;
  }
`;

const Row = styled.div<{ bgColor: string }>`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 8px;
  background-color: ${(props) => props.bgColor};
  opacity: 0;
  animation: fadeIn 0.5s forwards;
  &:hover {
    background-color: #313131;
  }

  &:last-child {
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
  }
  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
  @media (max-width: 560px) {
    gap: 8px;
    padding: 4px;
    grid-template-columns: 1fr 0.5fr 1fr 1fr;
    text-align: center;
  }
`;

const BaseText = styled.div`
  font-family: Arial, sans-serif;
  font-size: 12px;
  color: ${(props) => props.color || "#CACACA"};
`;

const Cell = styled(BaseText)<{ isMarketName?: boolean }>`
  padding: 8px;
  font-family: Arial, sans-serif;
  font-weight: ${(props) => (props.isMarketName ? "700" : "400")};
  font-size: 12px;
  color: ${(props) => (props.isMarketName ? "#FFFFFF" : "#CACACA")};
  @media (max-width: 560px) {
    padding: 4px;
    font-size: 11px;
  }
`;

const Loader = styled(BaseText)`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-family: Arial, sans-serif;
  color: white;
  padding: 32px 16px;
`;

const ErrorContainer = styled(BaseText)`
  display: flex;
  justify-content: center;
  align-items: center;
  color: red;
  font-size: 12px;
  font-family: Arial, sans-serif;
  padding: 16px;
  padding: 32px 16px;
`;

interface Market {
  name: string;
  size: string;
  price: string;
  makerFee: string;
  takerFee: string;
}

interface Props {
  markets: Market[];
  isLoading: boolean;
  error: string | null;
}

const formatPriceToUSD = (price: string, ethPrice: number | null) => {
  const etherValue = ethers.formatUnits(price, "ether");
  const valueInEther = parseFloat(etherValue);
  const valueInUSD = valueInEther * (ethPrice ?? 0);
  let maximumFractionDigits = 2;

  if (valueInUSD > 0 && valueInUSD < 0.01) {
    const match = etherValue.match(/^0\.0*([1-9])/);
    if (match) {
      maximumFractionDigits = match[0].length - 2;
    }
  } else if (valueInUSD === 0) {
    maximumFractionDigits = 2;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: maximumFractionDigits,
  }).format(valueInUSD);
};

const calculateMarketSizeInUSD = (
  size: string,
  ethPrice: number | null
): number => {
  const sizeInEther = ethers.formatUnits(size, "ether");
  const sizeInUSD = parseFloat(sizeInEther) * (ethPrice ?? 0);
  return sizeInUSD;
};

const formatFeeToPercentage = (fee: string, price: string) => {
  const feeInEther = parseFloat(ethers.formatEther(fee));
  const priceInEther = parseFloat(ethers.formatEther(price));
  let feePercentage = (feeInEther / priceInEther) * 100;

  if (!isFinite(feePercentage)) {
    feePercentage = 0;
  }

  return `${feePercentage.toFixed(2)}%`;
};

const formatUSD = (value: number, useCompact: boolean) => {
  if (useCompact) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  } else {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
};

const formatPercentage = (percentage: number, useCompact: boolean) => {
  if (useCompact) {
    if (percentage > 100000) {
      return `${(percentage / 1000000).toFixed(2)}M%+`;
    }
    return `${percentage.toFixed(2)}%`;
  } else {
    return `${percentage.toFixed(2)}%`;
  }
};

export const MarketsList: React.FC<Props> = ({ markets, isLoading, error }) => {
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const loadEthPrice = async () => {
      const price = await fetchEthPrice();
      setEthPrice(price);
    };

    loadEthPrice();
  }, []);

  useEffect(() => {
    const updateCompactState = () => setIsCompact(window.innerWidth <= 740);
    updateCompactState();

    window.addEventListener("resize", updateCompactState);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", updateCompactState);
  }, []);

  // Convert size to a numeric value for sorting and add "-PERP" suffix to market name
  const sortedMarkets = markets
    .map((market) => ({
      ...market,
      name: `${market.name}-PERP`,
      numericSize: Number(market.size),
    }))
    .sort((a, b) => b.numericSize - a.numericSize)
    .map((market, index) => ({
      ...market,
      bgColor: index % 2 === 0 ? "#212121" : "#1A1A1A",
    }));

  return (
    <TableContainer>
      <Header>
        <Cell isMarketName={true}>MARKET</Cell>
        <Cell isMarketName={false}>PRICE</Cell>
        <Cell isMarketName={false}>MARKET SIZE</Cell>
        <Cell isMarketName={false}>MAKER/TAKER</Cell>
      </Header>

      {error && <ErrorContainer>{error}</ErrorContainer>}
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        sortedMarkets.map((market) => (
          <Row key={market.name} bgColor={market.bgColor}>
            <Cell isMarketName={true}>{market.name}</Cell>
            <Cell>{formatPriceToUSD(market.price, ethPrice)}</Cell>
            <Cell>
              {formatUSD(
                calculateMarketSizeInUSD(market.size, ethPrice),
                isCompact
              )}
            </Cell>
            <Cell>
              {`${formatPercentage(
                parseFloat(
                  formatFeeToPercentage(market.makerFee, market.price)
                ),
                isCompact
              )} / ${formatPercentage(
                parseFloat(
                  formatFeeToPercentage(market.takerFee, market.price)
                ),
                isCompact
              )}`}
            </Cell>
          </Row>
        ))
      )}
    </TableContainer>
  );
};
