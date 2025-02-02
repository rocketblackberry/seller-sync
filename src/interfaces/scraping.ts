/** スクレイピング結果 */
export interface ScrapingResult {
  title?: string;
  price: number;
  stock: number;
  size?: number;
  error?: string;
}
