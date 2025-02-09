import {
  SubaccountDeposit as GrpcSubaccountDeposit,
  SubaccountBalance as GrpcSubaccountBalance,
  SubaccountBalanceTransfer as GrpcSubaccountBalanceTransfer,
  AccountPortfolio as GrpcAccountPortfolio,
  SubaccountPortfolio as GrpcSubaccountPortfolio,
} from '@injectivelabs/exchange-api/injective_accounts_rpc_pb'
import { Coin } from '@injectivelabs/ts-types'

export enum TransferType {
  Internal = 'internal',
  External = 'external',
  Withdraw = 'withdraw',
  Deposit = 'deposit',
}

export interface SubaccountTransfer {
  transferType: TransferType
  srcSubaccountId: string
  srcSubaccountAddress: string
  dstSubaccountId: string
  dstSubaccountAddress: string
  amount?: Coin
  executedAt: number
}

export interface SubaccountDeposit {
  totalBalance: string
  availableBalance: string
}

export interface SubaccountBalance {
  subaccountId: string
  accountAddress: string
  denom: string
  deposit?: SubaccountDeposit
}

export interface SubaccountPortfolio {
  subaccountId: string
  availableBalance: string
  lockedBalance: string
  unrealizedPnl: string
}

export interface AccountPortfolio {
  portfolioValue: string
  availableBalance: string
  lockedBalance: string
  unrealizedPnl: string
  subaccountsList: Array<SubaccountPortfolio>
}

export {
  GrpcSubaccountDeposit,
  GrpcSubaccountBalance,
  GrpcAccountPortfolio,
  GrpcSubaccountPortfolio,
  GrpcSubaccountBalanceTransfer,
}
