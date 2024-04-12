use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer as SplTransfer};

declare_id!("DcYfqSaBbi8U5gmXPe8NBYoQXYmJ8e1RyvRorjDyo55t");

#[program]
pub mod disperse {
    use super::*;

    pub fn multi_transfer_tokens<'info>(
        _ctx: Context<'_, '_, '_, 'info, MultiTransferTokens<'info>>,
        amounts: Vec<u64>,
    ) -> Result<()> {
        let source = &_ctx.accounts.from_ata;
        let token_program = &_ctx.accounts.token_program;
        let authority = &_ctx.accounts.from;

        let receipdents = &_ctx.remaining_accounts;
        require!(receipdents.len() == amounts.len(), MyError::LengthDifferent);
        let mut total_sum = 0;
        for amount in amounts.iter() {
            total_sum += amount;
        }
        let token_balance = source.amount;
        require!(token_balance >= total_sum, MyError::SmallBalance);

        for (destination, amount) in receipdents.iter().zip(amounts.iter()) {
            // Transfer tokens from taker to initializer
            let cpi_accounts = SplTransfer {
                from: source.to_account_info().clone(),
                to: destination.to_account_info().clone(),
                authority: authority.to_account_info().clone(),
            };
            let cpi_program = token_program.to_account_info();

            token::transfer(CpiContext::new(cpi_program, cpi_accounts), *amount)?;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct MultiTransferTokens<'info> {
    pub from: Signer<'info>,
    #[account(mut)]
    pub from_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum MyError {
    #[msg("Amount must specified!")]
    LengthDifferent,

    #[msg("Insufficient Token Balance!")]
    SmallBalance,
}
