# Steller-Swap-L2 #

🚀 Token Swap – Stellar Soroban Web3 dApp

A multi-wallet Token Swap Web3 application built using Stellar Soroban Smart Contracts with real-time event tracking and transaction status monitoring.

This project was created as part of the Stellar Builder Challenges – Level 2 (Yellow Belt Submission).

---

🌟 Features

✅ Multi-wallet connection (Albedo / Stellar Wallets Kit)
✅ Smart contract deployed on Stellar Testnet
✅ Swap XLM → Token using Soroban contract
✅ Real-time contract event listener
✅ Transaction status tracking (Pending / Success / Failed)
✅ Error handling:

- Wallet not connected
- Transaction rejected
- Insufficient balance

---

🧱 Tech Stack

Frontend

- React (Vite)
- Stellar Wallets Kit
- Stellar SDK

Smart Contract

- Rust
- Soroban SDK

Network

- Stellar Soroban Testnet

---
## Wallet Integration

This project integrates Stellar wallets using a dedicated integration file:

src/walletIntegration.js

Supported wallets:

- Freighter
- Albedo

Error handling implemented:

- Wallet not found
- Transaction rejected
- Insufficient balance
----- 
