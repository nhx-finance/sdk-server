import mongoose from "mongoose";

const complianceActionsSchema = new mongoose.Schema(
  {
    affectedAccountId: { type: String, required: true, unique: true },
    evmAddress: { type: String, required: true, unique: true },
    actionType: { type: String, required: true },
    reason: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const ComplianceAction = mongoose.model(
  "ComplianceAction",
  complianceActionsSchema,
);

export default ComplianceAction;
