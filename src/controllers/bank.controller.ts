import { Request, Response } from "express";
import { bankDetails } from "../config/bank.config";

export const getBankDetails = (req: Request, res: Response): void => {
  res.status(200).json(bankDetails);
};
