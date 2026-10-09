export interface FkFaqData {
  id: string
  title: string
  items: { question: string; answer: string }[]
  tone?: 'plain' | 'warm'
}
