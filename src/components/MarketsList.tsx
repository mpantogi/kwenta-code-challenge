import { ethers } from "ethers";
import styled from "styled-components";

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
    font-size: 10px;
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

const formatPriceToUSD = (price: string) => {
  const etherValue = ethers.formatUnits(price, "ether");
  const value = parseFloat(etherValue);

  let maximumFractionDigits = 2;

  if (value > 0 && value < 0.01) {
    const match = etherValue.match(/^0\.0*([1-9])/);
    if (match) {
      maximumFractionDigits = match[0].length - 2;
    }
  } else if (value === 0) {
    maximumFractionDigits = 2;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: maximumFractionDigits,
  }).format(value);
};

const formatMarketSizeToUSD = (size: string) => {
  const etherValue = ethers.formatUnits(size, "ether");
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(parseFloat(etherValue));
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

export const MarketsList: React.FC<Props> = ({ markets, isLoading, error }) => {
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
        sortedMarkets.map((market, index) => (
          <Row key={index} bgColor={market.bgColor}>
            <Cell isMarketName={true}>{market.name}</Cell>
            <Cell>{formatPriceToUSD(market.price)}</Cell>
            <Cell>{formatMarketSizeToUSD(market.size)}</Cell>
            <Cell>
              {`${formatFeeToPercentage(
                market.makerFee,
                market.price
              )} / ${formatFeeToPercentage(market.takerFee, market.price)}`}
            </Cell>
          </Row>
        ))
      )}
    </TableContainer>
  );
};
