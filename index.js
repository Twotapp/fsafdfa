// TODO: Сделать проверку баланса
// TODO: Сделать Проверку аллованс
// TODO: апрув аллованса
// TODO: swap

const { ethers } = require("ethers");
const axios = require('axios');
const fs = require('fs');
const usdc_abi = require('./usdc_abi.json');
const usdt_abi = require('./usdt_abi.json');


const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/polygon');

const privateKeys = fs.readFileSync('privatekeys.txt', 'utf-8').split('\n').map(wallet => wallet.trim()); // чтение приватников и создание массива

const contractUsdc = new ethers.Contract('0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', usdc_abi, provider) ;
const contractUsdt = new ethers.Contract('0xc2132D05D31c914a87C6611C10748AEb04B58e8F', usdt_abi, provider);

const inch_spender = '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD';

async function checkBalance() {

    let positiveBalance = true;

    for (privateKey of privateKeys) {

        const wallet = new ethers.Wallet(privateKey, provider);

        const balance = await provider.getBalance(wallet.address);
        const readBalanceMatic = ethers.utils.formatEther(balance);

        const balanceUsdc = await contractUsdc.balanceOf(wallet.address);
        const readBalanceUsdc = ethers.utils.formatUnits(balanceUsdc, 6);

        const balanceUsdt = await contractUsdt.balanceOf(wallet.address);
        const readBalanceUsdt = ethers.utils.formatUnits(balanceUsdt, 6);
        
        console.log(`Баланс Matic ${readBalanceMatic} / Баланс usdc ${readBalanceUsdc} / Баланс usdt ${readBalanceUsdt}`);

        if (readBalanceMatic <= 0) {
            positiveBalance = false;
            // console.log(`Пополните MATIC / Ваш адрес ${wallet.address}`);
        }

        if (readBalanceUsdc <= 0 && readBalanceUsdt <= 0) {
            positiveBalance = false;
            // console.log(`Нету стейбла для SWAP / Ваш адрес ${wallet.address}`);
        }

        // if (readBalanceUsdc >= 0 && readBalanceUsdt >= 0) {
        //     await approveToken(readBalanceUsdc, readBalanceUsdt);
        // }

    }

    return positiveBalance;
    

}

async function checkAllowance() {
    for (privateKey of privateKeys) {
        const wallet = new ethers.Wallet(privateKey, provider);
        const allowance = await contractUsdc.allowance(wallet.address, inch_spender);
        
        if (allowance <= 0) {
            return false;
        }

        if (allowance > 0) {
            return true;
        }
    }   

}

async function approveToken(readBalanceUsdc, readBalanceUsdt) {
    if (readBalanceUsdc > readBalanceUsdt) {
        return readBalanceUsdc
    }

}




async function main() {
    checkBalance()
}

main()
