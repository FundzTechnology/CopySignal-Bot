import { RestClientV5 } from 'bybit-api';

const client = new RestClientV5({
    testnet: true
});

async function ping() {
    try {
        console.log("Pinging Bybit Testnet...");
        const res = await client.getServerTime();
        console.log("Server time:", res);
    } catch (e) {
        console.error("Ping error:", e);
    }
}
ping();
