import { getMappedTokensByAddress } from './tokens/helpers/mapByAddress'
import { TokenMeta } from './types'

export class Erc20TokenMeta {
  protected tokens: Record<string, TokenMeta>

  protected tokensByAddress: Record<string, TokenMeta>

  constructor(tokens: Record<string, TokenMeta>) {
    this.tokens = tokens
    this.tokensByAddress = getMappedTokensByAddress(tokens)
  }

  getMetaBySymbol(symbol: string): TokenMeta | undefined {
    const { tokens: tokensBySymbol } = this
    const erc20Symbol = symbol.toUpperCase() as keyof typeof tokensBySymbol

    if (!tokensBySymbol[erc20Symbol]) {
      return
    }

    return tokensBySymbol[erc20Symbol]
  }

  getMetaByAddress(address: string): TokenMeta | undefined {
    const { tokensByAddress } = this
    const erc20Address = address.toLowerCase() as keyof typeof tokensByAddress

    if (!tokensByAddress[erc20Address]) {
      return
    }

    return tokensByAddress[erc20Address]
  }

  getCoinGeckoIdFromSymbol(symbol: string): string {
    const { tokens: tokensBySymbol } = this
    const symbolToLowerCase =
      symbol.toLowerCase() as keyof typeof tokensBySymbol

    if (!tokensBySymbol[symbolToLowerCase]) {
      return ''
    }

    return tokensBySymbol[symbolToLowerCase].coinGeckoId || ''
  }
}
