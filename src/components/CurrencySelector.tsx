import { CURRENCY_CONFIG, type CurrencyCode } from '../utils/loadFurniture'

interface CurrencySelectorProps {
  value: CurrencyCode
  onChange: (currency: CurrencyCode) => void
}

export default function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="currency" className="text-sm text-gray-600 dark:text-gray-300">
        Currency:
      </label>
      <select
        id="currency"
        value={value}
        onChange={(e) => onChange(e.target.value as CurrencyCode)}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {Object.entries(CURRENCY_CONFIG).map(([code, { symbol }]) => (
          <option key={code} value={code}>
            {code} ({symbol})
          </option>
        ))}
      </select>
    </div>
  )
} 