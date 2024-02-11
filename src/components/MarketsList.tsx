import { ethers } from "ethers";
import styled from "styled-components";

const TableContainer = styled.div`
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  border: 1px solid #313131;
  border-radius: 5px;
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
`;

const Row = styled.div<{ bgColor: string }>`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 8px;
  background-color: ${(props) => props.bgColor};
  &:hover {
    background-color: #313131;
  }

  &:last-child {
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
  }
`;

const Cell = styled.div<{ isMarketName?: boolean }>`
  padding: 8px;
  font-family: Arial, sans-serif;
  font-weight: ${(props) => (props.isMarketName ? "700" : "400")};
  font-size: 12px;
  color: ${(props) => (props.isMarketName ? "#FFFFFF" : "#CACACA")};
`;

const Loader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-family: Arial, sans-serif;
  color: white;
  padding: 32px 16px;
`;

const ErrorContainer = styled.div`
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

const formatPriceToUSD = (price: string) => {
  const etherValue = ethers.formatUnits(price, "ether");
  // For real applications, we may use a third-party API service that offers cryptocurrency market data, such as CoinGecko, CoinMarketCap
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(parseFloat(etherValue));
};

const formatMarketSizeToUSD = (size: string) => {
  const etherValue = ethers.formatUnits(size, "ether");
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(parseFloat(etherValue));
};

const formatFeeToPercentage = (fee: string) => {
  const feeInEther = ethers.formatUnits(fee, "ether");
  const percentage = parseFloat(feeInEther) * 100;
  return `${percentage.toFixed(2)}%`;
};

export const MarketsList: React.FC<Props> = ({ markets, isLoading, error }) => {
  // Convert size to a numeric value for sorting and add "-PERP" suffix to market name
  const sortedMarkets = markets
    .map((market) => ({
      ...market,
      name: `${market.name}-PERP`,
      numericSize: Number(market.size), // Convert size for sorting
    }))
    .sort((a, b) => b.numericSize - a.numericSize)
    .map((market, index) => ({
      ...market,
      // Assign bgColor based on new index after sorting
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
        sortedMarkets.map((market, index) => (
          <Row key={index} bgColor={market.bgColor}>
            <Cell isMarketName={true}>{market.name}</Cell>
            <Cell>{formatPriceToUSD(market.price)}</Cell>
            <Cell>{formatMarketSizeToUSD(market.size)}</Cell>
            <Cell>
              {`${formatFeeToPercentage(
                market.makerFee
              )}/${formatFeeToPercentage(market.takerFee)}`}
            </Cell>
          </Row>
        ))
      )}
    </TableContainer>
  );
};
