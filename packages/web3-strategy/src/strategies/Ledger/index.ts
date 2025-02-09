/* eslint-disable class-methods-use-this */
import { AccountAddress, ChainId } from '@injectivelabs/ts-types'
import { TypedDataUtils } from 'eth-sig-util'
import { bufferToHex, addHexPrefix } from 'ethereumjs-util'
import { Transaction } from 'ethereumjs-tx'
import Web3 from 'web3'
import { Web3Exception } from '@injectivelabs/exceptions'
import {
  ConcreteStrategyOptions,
  ConcreteWeb3Strategy,
  LedgerDerivationPathType,
  LedgerWalletInfo,
} from '../../types'
import BaseConcreteStrategy from '../Base'
import {
  DEFAULT_BASE_DERIVATION_PATH,
  DEFAULT_ADDRESS_SEARCH_LIMIT,
  DEFAULT_NUM_ADDRESSES_TO_FETCH,
} from '../../constants'
import LedgerHW from './hw'

const domainHash = (message: any) =>
  TypedDataUtils.hashStruct('EIP712Domain', message.domain, message.types, true)

const messageHash = (message: any) =>
  TypedDataUtils.hashStruct(
    message.primaryType,
    message.message,
    message.types,
    true,
  )

const getSignableTx = async ({
  web3,
  txData,
  address,
  chainId,
}: {
  web3: Web3
  txData: any
  address: AccountAddress
  chainId: ChainId
}) => {
  const nonce = await web3.eth.getTransactionCount(address)
  const gasInHex = addHexPrefix(txData.gas)
  const gasPriceInHex = addHexPrefix(txData.gasPrice)
  const tx = {
    ...txData,
    from: address,
    gas: gasInHex,
    gasLimit: gasInHex,
    gasPrice: gasPriceInHex,
    nonce: addHexPrefix(nonce.toString(16)),
  }

  return new Transaction(tx, { chain: chainId })
}

export default class Ledger
  extends BaseConcreteStrategy
  implements ConcreteWeb3Strategy
{
  private baseDerivationPath: string

  private derivationPathType: LedgerDerivationPathType

  private ledger: LedgerHW

  constructor({
    chainId,
    options,
  }: {
    chainId: ChainId
    options: ConcreteStrategyOptions
  }) {
    super({ chainId, options })

    this.baseDerivationPath = DEFAULT_BASE_DERIVATION_PATH
    this.derivationPathType =
      options.derivationPathType || LedgerDerivationPathType.LedgerLive
    this.ledger = new LedgerHW()
  }

  public async getAddresses(): Promise<string[]> {
    const { baseDerivationPath, derivationPathType } = this
    const accountManager = await this.ledger.getAccountManager()

    try {
      const wallets = await accountManager.getWallets(
        baseDerivationPath,
        derivationPathType,
      )
      return wallets.map((k) => k.address)
    } catch (e: any) {
      const message = e.message || e

      if (
        message.includes('Ledger device: Incorrect length') ||
        message.includes('Ledger device: INS_NOT_SUPPORTED') ||
        message.includes('Ledger device: CLA_NOT_SUPPORTED') ||
        message.includes('Failed to open the device') ||
        message.includes('Failed to open the device') ||
        message.includes('Ledger Device is busy') ||
        message.includes('UNKNOWN_ERROR')
      ) {
        throw new Error(
          'Please ensure your Ledger is connected, unlocked and your Ethereum app is open',
        )
      }

      throw new Error(message)
    }
  }

  async confirm(address: AccountAddress): Promise<string> {
    return Promise.resolve(
      `0x${Buffer.from(
        `Confirmation for ${address} at time: ${Date.now()}`,
      ).toString('hex')}`,
    )
  }

  async sendTransaction(
    txData: any,
    options: { address: string; chainId: ChainId },
  ): Promise<string> {
    const chainId = parseInt(options.chainId.toString(), 10)
    const web3 = this.getWeb3ForChainId(chainId)

    const tx = await getSignableTx({
      web3,
      txData,
      address: options.address,
      chainId,
    })
    const vIndex = 6
    tx.raw[vIndex] = Buffer.from([chainId]) // v
    const rIndex = 7
    tx.raw[rIndex] = Buffer.from([]) // r
    const sIndex = 8
    tx.raw[sIndex] = Buffer.from([]) // s
    const serializedTx = tx.serialize().toString('hex')

    const ledger = await this.ledger.getInstance()
    const { derivationPath } = await this.getWalletForAddress(options.address)

    let signedSerializedTx
    try {
      const signed = await ledger.signTransaction(derivationPath, serializedTx)
      tx.r = Buffer.from(signed.r, 'hex')
      tx.s = Buffer.from(signed.s, 'hex')
      tx.v = Buffer.from(signed.v, 'hex')

      signedSerializedTx = tx.serialize().toString('hex')
    } catch (e: any) {
      throw new Error(`Ledger: ${e.message}`)
    }

    try {
      const txReceipt = await web3.eth.sendSignedTransaction(
        addHexPrefix(signedSerializedTx),
      )
      return txReceipt.transactionHash
    } catch (e: any) {
      throw new Web3Exception(`Ledger: ${e.message}`)
    }
  }

  async signTypedDataV4(
    eip712json: string,
    address: AccountAddress,
  ): Promise<string> {
    const { derivationPath } = await this.getWalletForAddress(address)
    const object = JSON.parse(eip712json)
    const ledger = await this.ledger.getInstance()
    const result = await ledger.signEIP712HashedMessage(
      derivationPath,
      bufferToHex(domainHash(object)),
      bufferToHex(messageHash(object)),
    )

    const combined = `${result.r}${result.s}${result.v.toString(16)}`

    return combined.startsWith('0x') ? combined : `0x${combined}`
  }

  async getNetworkId(): Promise<string> {
    return (
      await this.getWeb3ForChainId(this.chainId).eth.net.getId()
    ).toString()
  }

  async getChainId(): Promise<string> {
    return (
      await this.getWeb3ForChainId(this.chainId).eth.getChainId()
    ).toString()
  }

  async getTransactionReceipt(txHash: string): Promise<string> {
    return Promise.resolve(txHash)
  }

  private async getWalletForAddress(
    address: string,
  ): Promise<LedgerWalletInfo> {
    const { baseDerivationPath, derivationPathType } = this
    const accountManager = await this.ledger.getAccountManager()

    if (!accountManager.hasWalletForAddress(address)) {
      for (
        let i = 0;
        i < DEFAULT_ADDRESS_SEARCH_LIMIT / DEFAULT_NUM_ADDRESSES_TO_FETCH;
        i += 1
      ) {
        await accountManager.getWallets(baseDerivationPath, derivationPathType)

        if (accountManager.hasWalletForAddress(address)) {
          return (await accountManager.getWalletForAddress(
            address,
          )) as LedgerWalletInfo
        }
      }
    }

    return (await accountManager.getWalletForAddress(
      address,
    )) as LedgerWalletInfo
  }

  isWeb3Connected = (): boolean => true // TODO

  isMetamask = (): boolean => false
}
