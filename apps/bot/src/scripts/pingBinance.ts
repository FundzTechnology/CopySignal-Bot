import BinancePkg from 'binance-api-node';
const Binance = BinancePkg.default || BinancePkg;

// We need to cast it to any because of the default export issue
const client = (Binance as any)({
    httpFutures: 'https://testnet.binancefuture.com'
});

async function ping() {
    try {
        console.log("Pinging Binance Testnet...");
        const res = await client.futuresPing();
        console.log("Ping successful:", res);
    } catch (e) {
        console.error("Ping error:", e);
    }
}
ping();
