import { Request, Response } from "express";
import { bankDetails } from "../config/bank.config";

export const getBankDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.status(200).json(bankDetails);
};
