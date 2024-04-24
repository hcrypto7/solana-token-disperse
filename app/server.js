const web3 = require("@solana/web3.js");
const dotenv = require("dotenv");
const anchor = require("@coral-xyz/anchor");
const bs58 = require("bs58");
const {
  createMint,
  createAssociatedTokenAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} = require("@solana/spl-token");

dotenv.config();
const http = require('http');
const { throws } = require("assert");

// create a server object

const port = process.env.PORT || 3000;


let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
let provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.Disperse;


const keypair = web3.Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY))
const wallet = new anchor.Wallet(keypair);

const investAmount = [60, 30];
const accounts = [
  "4Dod1eVmrFMzFbQyc7wkkxYWNpg6Dv2wLqKePYg1RGYV",
  "6ndTuVPdcD1KbnMpiU7DE7U2CHJRbwXHvn8PsEGvZ6tj",
];

const tokenAddressStr = "2ga6K9MSqEMivvP3kyeNoo16y281yLLmhuYdaFmGq5KC";

/**
 *
 * @param {*} fromKp     Keypair fromAccount
 * @param {*} fromAta    ATA fromAccount
 * @param {*} mint       TokenAddress
 * @param {*} receivers  receiver Array
 */
const _disperseTokens = async (fromKp, fromAta, mint, receivers) => {
  if (connection) {
    try {
      console.log("Token distribution started!");
      const receiversATA = [];

      for (receiver of receivers) {
        try{
          const toAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            receiver
          );
          receiversATA.push(toAta);
        } catch(e){
          console.log("error frist:", e);
        }
      }

      // Send transaction
      const amounts = [];
      const accounts = [];

      for (receiverATA of receiversATA) {
        accounts.push({
          pubkey: receiverATA,
          isSigner: false,
          isWritable: true,
        });
        let tokenAccountBalance = await connection.getTokenAccountBalance(
          receiverATA.address
        );
        console.log(tokenAccountBalance.value.amount);
      }

      let tokenAccountBalance = await connection.getTokenAccountBalance(
        fromAta.address
      );
      console.log(tokenAccountBalance.value.amount)

      for (let i = 0; i < receivers.length; i++) {
        const tokenAmount =
          (tokenAccountBalance.value.amount * investAmount[i]) / 100;
        amounts.push(new anchor.BN(tokenAmount));
      }
      const txHash = await program.methods
        .multiTransferTokens(amounts)
        .accounts({
          from: keypair.publicKey,
          fromAta: fromAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .remainingAccounts(accounts)
        .signers([keypair])
        .rpc();
      console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
      await program.provider.connection.confirmTransaction(txHash, "finalized");
    } catch (e) {
      console.log(e);
    }
  } else {
    console.log("connection error!");
  }
};
/***
 * mint: tokenAddress
 */
const checkTokenBalance = async (mint) => {

  let tokenAccountBalance = 0;

  try{

    const fromAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );

    let tokenAccountBalanceStruct = (await connection.getTokenAccountBalance(fromAta.address));
    console.log(
      `decimals: ${tokenAccountBalanceStruct.value.decimals}, amount: ${tokenAccountBalanceStruct.value.amount}`
    );
    tokenAccountBalance = tokenAccountBalanceStruct.value.amount;
    
    if (tokenAccountBalance > 0) {
      console.log("token detected!");
      const receivers = accounts.map((account) => new web3.PublicKey(account));
      _disperseTokens(keypair, fromAta, mint, receivers);
    }
  } catch (e) {
    console.log("error seconde", e);
  }

};

setInterval(async () => {

  const tokenAddress = new web3.PublicKey(tokenAddressStr);
  checkTokenBalance(tokenAddress);
}, 5000);


const server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is Runing');
}).listen(port);


console.log(`Server started on port:${port}`);
