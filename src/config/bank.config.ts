export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  swiftCode: string;
}

export const bankDetails: BankDetails = {
  bankName: "KCB Bank",
  accountName: "NHX Finance",
  accountNumber: "394722734910",
  branch: "Westlands, Nairobi",
  swiftCode: "KCBLKENXXXX",
};
