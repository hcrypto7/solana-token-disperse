const { Keypair } = require('@solana/web3.js');
const base58 = require("bs58");
const fs = require('fs');
const dotenv = require('dotenv')

dotenv.config();
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Private key from phantom
const PUBLIC_KEY = process.env.PUBLIC_KEY; // Fill with your address to verify
const secret = base58.decode(PRIVATE_KEY);

// Check if the pk is correct 
const pair = Keypair.fromSecretKey(secret);

if (pair.publicKey.toString() == PUBLIC_KEY) {
  fs.writeFileSync(
    'id.json',
    JSON.stringify(Array.from(secret))
  );
}