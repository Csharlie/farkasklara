/** Titled list block (service: "Mit tartalmaz", "Mit kérünk Öntől"). */
export interface FkListData {
  id: string
  title: string
  items: string[]
  tone?: 'plain' | 'warm'
}
