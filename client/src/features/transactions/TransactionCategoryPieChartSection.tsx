import React from "react";
import styles from "../../app/page.module.css";
import EmptyState from "../../components/EmptyState";
import TransactionsPieChart from "../../components/TransactionsPieChart";
import type { ChartData } from "../../hooks/useCategoryTotals";

interface Props {
  pieData: ChartData[];
}

const TransactionCategoryPieChartSection: React.FC<Props> = ({ pieData }) => {
  if (!pieData || pieData.length === 0)
    return (
      <EmptyState message="No transaction data available for this period." />
    );

  return (
    <section className={styles.section}>
      <h3>Transaction Categories Distribution:</h3>
      <TransactionsPieChart data={pieData} />
    </section>
  );
};

export default TransactionCategoryPieChartSection;
