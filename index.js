const { ethers } = require("ethers");
const axios = require('axios');
const fs = require('fs');
const ABI = require('./erc20abi.json');
const { Hash } = require("crypto");


const privateKeys = fs.readFileSync('wallets.txt', 'utf-8').split('\n').map(wallet => wallet.trim());

const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');

const contractAddressUsdc = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
const inch_spender = '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD';

const contractUsdc = new ethers.Contract(contractAddressUsdc, ABI, provider);
const amount = ethers.utils.parseUnits('1', 6);


async function checkAllowance(wallet, spenderAddress) {
  const allowance = await contractUsdc.allowance(wallet, spenderAddress);
  console.log(`Allowance: ${allowance}`)
}


async function approveToken(contractWithWallet, spenderAddress, amount) {
  const approveTx = await contractWithWallet.approve(spenderAddress, amount);
  await approveTx.wait()
  console.log(`Approved`);
}


async function main() {

  for (let privateKey of privateKeys) {

    const wallet = new ethers.Wallet(privateKey, provider);
    const contractWithWallet = contractUsdc.connect(wallet);

    try {
      await approveToken(contractWithWallet, inch_spender, amount)
    
    } catch (error) {
      console.error(error);
    }

  }

}

main()
