import { useState } from "react";
import { buildSwapTx, submitTx, pollTxStatus } from "../contractClient";
import { signTransaction } from "../walletKit";

export default function SwapForm({ wallet, setTxState }) {
  const [amountIn, setAmountIn] = useState("");
  const [minOut, setMinOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSwap() {
    // ❌ Wallet not connected
    if (!wallet) {
      setTxState(prev => [
        {
          status: "Failed ❌",
          hash: null,
          error: "Wallet not connected",
          time: new Date().toLocaleTimeString(),
        },
        ...(prev || []),
      ]);
      return;
    }

    setLoading(true);
    setStatus("Waiting for wallet approval…");

    try {
      // ⏳ Show pending immediately
      setTxState(prev => [
        {
          status: "Pending ⏳",
          hash: null,
          error: null,
          time: new Date().toLocaleTimeString(),
        },
        ...(prev || []),
      ]);

      // 1️⃣ Build transaction
      const tx = await buildSwapTx(
        wallet.address,
        parseFloat(amountIn),
        parseFloat(minOut)
      );

      // 2️⃣ Sign transaction
      setStatus("Please approve the transaction in your wallet…");
      const signedXdr = await signTransaction(
        tx.toXDR(),
        wallet.wallet
      );

      // 3️⃣ Submit transaction
      setStatus("Submitting transaction to Stellar network…");
      const hash = await submitTx(signedXdr);

      // ⏳ Update pending with hash
      setTxState(prev => [
        {
          status: "Pending ⏳",
          hash,
          error: null,
          time: new Date().toLocaleTimeString(),
        },
        ...(prev || []),
      ]);

      // 4️⃣ Poll transaction result
      setStatus("Waiting for on-chain confirmation…");
      const finalStatus = await pollTxStatus(hash);

      if (finalStatus === "SUCCESS") {
        setStatus("Swap successful ✅");
        setTxState(prev => [
          {
            status: "Success ✅",
            hash,
            error: null,
            time: new Date().toLocaleTimeString(),
          },
          ...(prev || []),
        ]);
      } else if (finalStatus === "FAILED") {
        setStatus("Transaction failed on-chain ❌");
        setTxState(prev => [
          {
            status: "Failed ❌",
            hash,
            error: "Transaction failed on-chain",
            time: new Date().toLocaleTimeString(),
          },
          ...(prev || []),
        ]);
      } else {
        setStatus("Transaction confirmation timeout ⏱️");
        setTxState(prev => [
          {
            status: "Timeout ⏱️",
            hash,
            error: "Transaction confirmation timeout",
            time: new Date().toLocaleTimeString(),
          },
          ...(prev || []),
        ]);
      }

    } catch (err) {
      let message = err?.message || "Transaction error";

      if (message.toLowerCase().includes("rejected")) {
        message = "Transaction rejected by wallet";
      }

      if (message.toLowerCase().includes("cancel")) {
        message = "Transaction cancelled by user";
      }

      setStatus("Transaction cancelled or failed ❌");

      setTxState(prev => [
        {
          status: "Failed ❌",
          hash: null,
          error: message,
          time: new Date().toLocaleTimeString(),
        },
        ...(prev || []),
      ]);

    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "#f9f9f9",
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Swap XLM → Token
      </p>

      <input
        value={amountIn}
        onChange={(e) => setAmountIn(e.target.value)}
        placeholder="Amount in (XLM)"
        type="number"
        style={input}
      />

      <input
        value={minOut}
        onChange={(e) => setMinOut(e.target.value)}
        placeholder="Min amount out"
        type="number"
        style={{ ...input, marginTop: 8 }}
      />

      {/* ✅ Level-3 Progress Indicator */}
      {status && (
        <div
          style={{
            marginTop: 10,
            padding: 8,
            background: "#eef2ff",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          {status}
        </div>
      )}

      <button
        onClick={handleSwap}
        disabled={loading || !amountIn || !minOut}
        style={{
          marginTop: 12,
          padding: "10px 24px",
          background: "#6d28d9",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 14,
          width: "100%",
        }}
      >
        {loading ? "Swapping…" : "Swap"}
      </button>
    </div>
  );
}

const input = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 14,
  boxSizing: "border-box",
};