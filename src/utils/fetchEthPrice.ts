const fetchEthPrice = async (): Promise<number> => {
  const url = `https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD`;

  const headers = {
    authorization: `Apikey ${process.env.CRYPTOCOMPARE_API_KEY}`,
  };

  const response = await fetch(url, { headers });
  const data = await response.json();

  return data.USD;
};

export default fetchEthPrice;
