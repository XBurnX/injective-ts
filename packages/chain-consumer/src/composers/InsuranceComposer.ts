import { AccountAddress } from '@injectivelabs/ts-types'
import snakeCaseKeys from 'snakecase-keys'
import {
  MsgCreateInsuranceFund,
  MsgRequestRedemption,
  MsgUnderwrite,
} from '@injectivelabs/chain-api/injective/insurance/v1beta1/tx_pb'
import { Coin } from '@injectivelabs/chain-api/cosmos/base/v1beta1/coin_pb'
import { OracleTypeMap } from '@injectivelabs/chain-api/injective/oracle/v1beta1/oracle_pb'

export class InsuranceComposer {
  static underwrite({
    marketId,
    amount,
    denom,
    injectiveAddress,
  }: {
    marketId: string
    denom: string
    amount: string
    injectiveAddress: AccountAddress
  }) {
    const deposit = new Coin()
    deposit.setAmount(amount)
    deposit.setDenom(denom)

    const message = new MsgUnderwrite()
    message.setDeposit(deposit)
    message.setMarketId(marketId)
    message.setSender(injectiveAddress)

    return {
      ...snakeCaseKeys(message.toObject()),
      '@type': '/injective.insurance.v1beta1.MsgUnderwrite',
    }
  }

  static requestRedemption({
    marketId,
    amount,
    denom,
    injectiveAddress,
  }: {
    marketId: string
    denom: string
    amount: string
    injectiveAddress: AccountAddress
  }) {
    const amountToRedeem = new Coin()
    amountToRedeem.setAmount(amount)
    amountToRedeem.setDenom(denom)

    const message = new MsgRequestRedemption()
    message.setAmount(amountToRedeem)
    message.setMarketId(marketId)
    message.setSender(injectiveAddress)

    return {
      ...snakeCaseKeys(message.toObject()),
      '@type': '/injective.insurance.v1beta1.MsgRequestRedemption',
    }
  }

  static createInsuranceFund({
    fund,
    deposit,
    injectiveAddress,
  }: {
    fund: {
      ticker: string
      quoteDenom: string
      oracleBase: string
      oracleQuote: string
      oracleType: OracleTypeMap[keyof OracleTypeMap]
      expiry?: number
    }
    deposit: {
      amount: string
      denom: string
    }
    injectiveAddress: AccountAddress
  }) {
    const initialDeposit = new Coin()
    initialDeposit.setAmount(deposit.amount)
    initialDeposit.setDenom(deposit.denom)

    const message = new MsgCreateInsuranceFund()
    message.setTicker(fund.ticker)
    message.setQuoteDenom(fund.quoteDenom)
    message.setOracleBase(fund.oracleBase)
    message.setOracleQuote(fund.oracleQuote)
    message.setOracleType(fund.oracleType)
    message.setSender(injectiveAddress)
    message.setInitialDeposit(initialDeposit)
    message.setExpiry(fund.expiry ? fund.expiry : -1)

    return {
      ...snakeCaseKeys(message.toObject()),
      '@type': '/injective.insurance.v1beta1.MsgCreateInsuranceFund',
    }
  }
}
