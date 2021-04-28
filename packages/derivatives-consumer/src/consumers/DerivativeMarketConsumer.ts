import {
  MarketsRequest,
  MarketsResponse,
  MarketRequest,
  MarketResponse,
  OrderbookRequest,
  OrderbookResponse,
  OrdersRequest,
  OrdersResponse,
  TradesRequest,
  TradesResponse,
  DerivativeMarketInfo,
  PositionsRequest,
  PositionsResponse,
} from '@injectivelabs/exchange-api/injective_derivative_exchange_rpc_pb'
import { InjectiveDerivativeExchangeRPC } from '@injectivelabs/exchange-api/injective_derivative_exchange_rpc_pb_service'
import { GrpcException } from '@injectivelabs/exceptions'
import { AccountAddress, TradeExecutionSide } from '@injectivelabs/ts-types'
import BaseConsumer from '../BaseConsumer'

export class DerivativeMarketConsumer extends BaseConsumer {
  async fetchMarkets() {
    const request = new MarketsRequest()

    try {
      const response = await this.request<
        MarketsRequest,
        MarketsResponse,
        typeof InjectiveDerivativeExchangeRPC.Markets
      >(request, InjectiveDerivativeExchangeRPC.Markets)

      return response.getMarketsList()
    } catch (e) {
      throw new GrpcException(e.message)
    }
  }

  async fetchMarket(marketId: string): Promise<DerivativeMarketInfo> {
    const request = new MarketRequest()
    request.setMarketId(marketId)

    try {
      const response = await this.request<
        MarketRequest,
        MarketResponse,
        typeof InjectiveDerivativeExchangeRPC.Market
      >(request, InjectiveDerivativeExchangeRPC.Market)

      const market = response.getMarket()

      if (!market) {
        throw new GrpcException(`Market with marketId ${marketId} not found`)
      }

      return market
    } catch (e) {
      throw new GrpcException(e.message)
    }
  }

  async fetchMarketOrderbook(marketId: string) {
    const request = new OrderbookRequest()
    request.setMarketId(marketId)

    try {
      const response = await this.request<
        OrderbookRequest,
        OrderbookResponse,
        typeof InjectiveDerivativeExchangeRPC.Orderbook
      >(request, InjectiveDerivativeExchangeRPC.Orderbook)

      const orderbook = response.getOrderbook()

      return {
        buys: orderbook ? orderbook.getBuysList() : [],
        sells: orderbook ? orderbook.getSellsList() : [],
      }
    } catch (e) {
      throw new GrpcException(e.message)
    }
  }

  async fetchMarketOrders({
    marketId,
    subaccountId,
  }: {
    marketId: string
    subaccountId?: AccountAddress
  }) {
    const request = new OrdersRequest()
    request.setMarketId(marketId)

    if (subaccountId) {
      request.setSubaccountId(subaccountId)
    }

    try {
      const response = await this.request<
        OrdersRequest,
        OrdersResponse,
        typeof InjectiveDerivativeExchangeRPC.Orders
      >(request, InjectiveDerivativeExchangeRPC.Orders)

      return response.getOrdersList()
    } catch (e) {
      throw new GrpcException(e.message)
    }
  }

  async fetchMarketPositions({
    marketId,
    subaccountId,
  }: {
    marketId: string
    subaccountId?: AccountAddress
  }) {
    const request = new PositionsRequest()
    request.setMarketId(marketId)

    if (subaccountId) {
      request.setSubaccountId(subaccountId)
    }

    try {
      const response = await this.request<
        PositionsRequest,
        PositionsResponse,
        typeof InjectiveDerivativeExchangeRPC.Positions
      >(request, InjectiveDerivativeExchangeRPC.Positions)

      return response.getPositionsList()
    } catch (e) {
      throw new GrpcException(e.message)
    }
  }

  async fetchMarketTrades({
    marketId,
    subaccountId,
    executionSide,
  }: {
    marketId: string
    subaccountId?: AccountAddress
    executionSide?: TradeExecutionSide
  }) {
    const request = new TradesRequest()
    request.setMarketId(marketId)

    if (subaccountId) {
      request.setSubaccountId(subaccountId)
    }

    if (executionSide) {
      request.setExecutionSide(executionSide)
    }

    try {
      const response = await this.request<
        TradesRequest,
        TradesResponse,
        typeof InjectiveDerivativeExchangeRPC.Trades
      >(request, InjectiveDerivativeExchangeRPC.Trades)

      return response.getTradesList()
    } catch (e) {
      throw new GrpcException(e.message)
    }
  }
}