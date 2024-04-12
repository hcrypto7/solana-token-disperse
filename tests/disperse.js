const {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} = require('@solana/spl-token');
const anchor = require("@coral-xyz/anchor");
const web3 = require("@solana/web3.js");
const assert = require("assert");

describe("disperse", () => {
  // Configure the client to use the local cluster.
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  it("transferMultiSplTokens", async () => {
    // Generate keypairs for the new accounts
    const program = anchor.workspace.Disperse;

    const fromKp = provider.wallet.payer;
    const toKp = new web3.Keypair();
    const toKp1 = new web3.Keypair();

    // Create a new mint and initialize it
    const mintKp = new web3.Keypair();
    const mint = await createMint(
      program.provider.connection,
      provider.wallet.payer,
      fromKp.publicKey,
      null,
      0
    );

    // Create associated token accounts for the new accounts
    const fromAta = await createAssociatedTokenAccount(
      program.provider.connection,
      provider.wallet.payer,
      mint,
      fromKp.publicKey
    );
    const toAta = await createAssociatedTokenAccount(
      program.provider.connection,
      provider.wallet.payer,
      mint,
      toKp.publicKey
    );
    const toAta1 = await createAssociatedTokenAccount(
      program.provider.connection,
      provider.wallet.payer,
      mint,
      toKp1.publicKey
    );

    
    // Mint tokens to the 'from' associated token account
    const mintAmount = 5000;
    await mintTo(
      program.provider.connection,
      provider.wallet.payer,
      mint,
      fromAta,
      provider.wallet.publicKey,
      mintAmount
    );

    // Send transaction
    const transferAmount = new anchor.BN(500);
    const transferAmount1 = new anchor.BN(500);
    const amounts = [transferAmount, transferAmount1];
    const accounts = [
      {pubkey: toAta, isSigner: false, isWritable: true},
      {pubkey: toAta1, isSigner: false, isWritable: true}
    ];
    const txHash = await program.methods
      .multiTransferTokens(amounts)
      .accounts({
        from: fromKp.publicKey,
        fromAta: fromAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .remainingAccounts(accounts)
      .signers([provider.wallet.payer, fromKp])
      .rpc();
    console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
    await program.provider.connection.confirmTransaction(txHash, "finalized");
    const toTokenAccount = await program.provider.connection.getTokenAccountBalance(toAta);
    const toTokenAccount1 = await program.provider.connection.getTokenAccountBalance(toAta1);
    assert.strictEqual(
      toTokenAccount.value.uiAmount,
      transferAmount.toNumber(),
      "The 'to' token account should have the transferred tokens"
    );
    assert.strictEqual(
      toTokenAccount1.value.uiAmount,
      transferAmount1.toNumber(),
      "The 'to' token account should have the transferred tokens"
    );
  });
});
