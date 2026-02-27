import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    accountId: { type: String, required: true, unique: true },
    evmAddress: { type: String, required: true, unique: true },
    frozenDate: { type: Date, default: null },
    freezeReason: { type: String, default: null },
    status: {
      type: String,
      enum: ["active", "frozen", "wiped"],
      default: "active",
    },
    isWiped: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Account = mongoose.model("Account", accountSchema);

export default Account;
