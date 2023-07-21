const { ethers } = require("ethers");
const axios = require('axios');
const fs = require('fs');
const ABI = require('./erc20abi.json');

const privateKeys = fs.readFileSync('wallets.txt', 'utf-8').split('\n').map(wallet => wallet.trim());

const provider = new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com');

const contractAddressUsdc = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
const contractAddressUsdt = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
const inch_spender = '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD';

const contractUsdc = new ethers.Contract(contractAddressUsdc, ABI, provider);
const amount = '1000000'

async function randomDelay(min = 30000, max = 120000) {
  return new Promise(resolve => {
    const delay = Math.random() * (max - min) + min;
    setTimeout(resolve, delay); 
  });
}


async function checkAllowance(wallet, spenderAddress) {
  const txAllowance = await contractUsdc.allowance(wallet, spenderAddress);
  console.log(`Allowance: ${txAllowance}`)
}


async function approveToken(spenderAddress, amount, wallet) {

  const contractWithSigner = contractUsdc.connect(wallet);

  await randomDelay()
  const approve = await contractWithSigner.populateTransaction.approve(
    spenderAddress,
    amount
  );

  const tx = {
    to: contractAddressUsdc,
    data: approve.data,
    gasPrice: ethers.utils.parseUnits('150', 'gwei'), 
    gasLimit: 50000,
  }

  const txResponse = await wallet.sendTransaction(tx);

  console.log('Transaction hash:', txResponse.hash);  

  await txResponse.wait();

  console.log('Approved');

}

async function swapTokens(fromToken, toToken, amount, wallet) {
  await randomDelay()
  const response = await axios.get(`https://api.1inch.io/v5.2/137/swap?src=${fromToken}&dst=${toToken}&amount=${amount}&from=1&slippage=1`);

  const data = response.data;
  console.log(data)

  // const tx = {
  //   from: data.from,
  //   to: data.to,
  //   data: data.data,
  //   value: data.value,
  // };

  // const signedTx = await wallet.signTransaction(tx);

  // const receipt = await provider.sendTransaction(signedTx);

  // console.log(`Swapped ${amount} USDC to USDT: ${receipt.hash}`);

}



async function main() {
  for (let privateKey of privateKeys) {

    const wallet = new ethers.Wallet(privateKey, provider);

    try {

      await checkAllowance(wallet.address, inch_spender)
      await approveToken(inch_spender, amount, wallet)
      
      await swapTokens(contractAddressUsdc, contractAddressUsdt, amount);
    
    } catch (error) {
      console.error(`Ошибка - ${error}`);
    }

  }

}

main()

