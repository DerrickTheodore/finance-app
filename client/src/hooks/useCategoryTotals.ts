/**
 * Custom hook to calculate category totals from a list of transactions.
 * Returns an array of objects formatted for use in pie charts.
 */
export function useCategoryTotals(transactions: any[]): any[] {
  const totals = transactions.reduce((acc, tx) => {
    if (tx.categories) {
      tx.categories.forEach((cat) => {
        acc[cat.id] = acc[cat.id] || {
          category: cat,
          total: 0,
        };
        acc[cat.id].total += Number(tx.amount);
      });
    }
    return acc;
  }, {} as Record<number, any>);

  return Object.values(totals);
}
