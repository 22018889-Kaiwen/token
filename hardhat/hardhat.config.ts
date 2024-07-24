import { vars } from "hardhat/config";
import * as fs from "fs";
import * as path from "path";
import { ApiBaseUrl } from "@fireblocks/fireblocks-web3-provider";

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const INFURA_API_KEY = vars.get("INFURA_API_KEY");
const FIREBLOCKS_API_KEY = vars.get("FIREBLOCKS_API_KEY");
const MNEMONIC = vars.get("MNEMONIC");
const apiSecret = fs.readFileSync(
  path.resolve(vars.get("FIREBLOCKS_SECRET_PATH")),
  "utf8"
);

module.exports = {
  solidity: "0.8.26",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: { mnemonic: MNEMONIC },
      fireblocks: {
        apiBaseUrl: ApiBaseUrl.Sandbox,
        privateKey: apiSecret,
        apiKey: FIREBLOCKS_API_KEY,
        vaultAccountIds: 1,
      },
    },
  },
};
