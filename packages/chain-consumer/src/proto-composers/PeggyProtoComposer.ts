import { AccountAddress } from '@injectivelabs/ts-types'
import {
  DEFAULT_BRIDGE_FEE_AMOUNT,
  DEFAULT_BRIDGE_FEE_DENOM,
} from '@injectivelabs/utils'
import { Coin } from '@injectivelabs/chain-api/cosmos/base/v1beta1/coin_pb'
import { MsgSendToEth } from '@injectivelabs/chain-api/injective/peggy/v1/msgs_pb'

export class PeggyProtoComposer {
  static withdraw({
    address,
    injectiveAddress,
    amount,
    denom,
    bridgeFeeDenom = DEFAULT_BRIDGE_FEE_DENOM,
    bridgeFeeAmount = DEFAULT_BRIDGE_FEE_AMOUNT,
  }: {
    denom: string
    address: AccountAddress
    injectiveAddress: AccountAddress
    amount: string
    bridgeFeeDenom?: string
    bridgeFeeAmount?: string
  }) {
    const coinAmount = new Coin()
    coinAmount.setDenom(denom)
    coinAmount.setAmount(amount)

    const bridgeFee = new Coin()
    bridgeFee.setDenom(bridgeFeeDenom)
    bridgeFee.setAmount(bridgeFeeAmount)

    const message = new MsgSendToEth()
    message.setAmount(coinAmount)
    message.setSender(injectiveAddress)
    message.setEthDest(address)
    message.setBridgeFee(bridgeFee)

    return {
      message,
      type: '/injective.peggy.v1.MsgSendToEth',
    }
  }
}
