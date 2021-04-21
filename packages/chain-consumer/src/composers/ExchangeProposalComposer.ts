import { Coin } from '@injectivelabs/chain-api/cosmos/base/v1beta1/coin_pb'
import { MsgSubmitProposal } from '@injectivelabs/chain-api/cosmos/gov/v1beta1/tx_pb'
import { BigNumber } from '@injectivelabs/utils'
import { AccountAddress } from '@injectivelabs/ts-types'
import {
  SpotMarketLaunchProposal,
  SpotMarketParamUpdateProposal,
  SpotMarketStatusSetProposal,
} from '@injectivelabs/chain-api/injective/exchange/v1beta1/tx_pb'
import snakeCaseKeys from 'snakecase-keys'
import { MarketStatusMap } from '@injectivelabs/chain-api/injective/exchange/v1beta1/exchange_pb'

export interface DepositProposalParams {
  amount: BigNumber
  denom: string
}

export class ExchangeProposalComposer {
  static spotMarketLaunch({
    market,
    deposit,
    proposer,
  }: {
    market: SpotMarketLaunchProposal.AsObject
    proposer: AccountAddress
    deposit: DepositProposalParams
  }) {
    const depositParams = new Coin()
    depositParams.setDenom(deposit.denom)
    depositParams.setAmount(deposit.amount.toFixed())

    const content = new SpotMarketLaunchProposal()
    content.setTitle(market.title)
    content.setDescription(market.description)
    content.setQuoteDenom(market.quoteDenom)
    content.setTicker(market.ticker)
    content.setBaseDenom(market.baseDenom)
    content.setMaxPriceScaleDecimals(market.maxPriceScaleDecimals)
    content.setMaxQuantityScaleDecimals(market.maxQuantityScaleDecimals)

    return {
      proposer,
      content: {
        '@type': '/injective.exchange.v1beta1.SpotMarketLaunchProposal',
        ...snakeCaseKeys(content.toObject()),
      },
      initial_deposit: [{ ...snakeCaseKeys(depositParams.toObject()) }],
      '@type': '/cosmos.gov.v1beta1.MsgSubmitProposal',
    }
  }

  static spotMarketUpdate({
    market,
    deposit,
    proposer,
  }: {
    market: SpotMarketParamUpdateProposal.AsObject
    proposer: AccountAddress
    deposit: DepositProposalParams
  }) {
    const depositParams = new Coin()
    depositParams.setDenom(deposit.denom)
    depositParams.setAmount(deposit.amount.toFixed())

    const content = new SpotMarketParamUpdateProposal()
    content.setTitle(market.title)
    content.setDescription(market.description)
    content.setMakerFeeRate(market.makerFeeRate)
    content.setTakerFeeRate(market.takerFeeRate)
    content.setRelayerFeeShareRate(market.relayerFeeShareRate)
    content.setMarketId(market.marketId)
    content.setMaxPriceScaleDecimals(market.maxPriceScaleDecimals)
    content.setMaxQuantityScaleDecimals(market.maxQuantityScaleDecimals)

    return {
      proposer,
      content: {
        '@type': '/injective.exchange.v1beta1.SpotMarketParamUpdateProposal',
        ...snakeCaseKeys(content.toObject()),
      },
      initial_deposit: [{ ...snakeCaseKeys(depositParams.toObject()) }],
      '@type': '/cosmos.gov.v1beta1.MsgSubmitProposal',
    }
  }

  static spotMarketStatusUpdate({
    status,
    deposit,
    proposer,
  }: {
    status: MarketStatusMap[keyof MarketStatusMap]
    proposer: AccountAddress
    deposit: DepositProposalParams
  }) {
    const depositParams = new Coin()
    depositParams.setDenom(deposit.denom)
    depositParams.setAmount(deposit.amount.toFixed())

    const content = new SpotMarketStatusSetProposal()
    content.setStatus(status)

    const cosmosMessage = new MsgSubmitProposal()
    cosmosMessage.setContent(content)
    cosmosMessage.setInitialDepositList([depositParams])
    cosmosMessage.setProposer(proposer)

    return {
      proposer,
      content: {
        '@type': '/injective.exchange.v1beta1.SpotMarketStatusSetProposal',
        ...snakeCaseKeys(content.toObject()),
      },
      initial_deposit: [{ ...snakeCaseKeys(depositParams.toObject()) }],
      '@type': '/cosmos.gov.v1beta1.MsgSubmitProposal',
    }
  }

  static perpetualMarketLaunch() {
    //
  }

  static expiryFuturesMarketLaunch() {
    //
  }

  static derivativeMarketUpdate() {
    //
  }

  static derivativeMarketStatusUpdate() {
    //
  }
}