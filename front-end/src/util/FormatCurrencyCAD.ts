const FormatCurrencyCAD = (amount: number) => {
    return (new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2, maximumFractionDigits: 2, currencyDisplay: "symbol" }).format(amount))
}

export default FormatCurrencyCAD;