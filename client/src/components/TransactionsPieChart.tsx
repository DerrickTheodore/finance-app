import type { Category } from "@myfi/server/types";
import { ArcElement, Chart, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

Chart.register(ArcElement, Tooltip, Legend);

type Props = {
  data: { category: Category; total: number }[];
};

export default function TransactionsPieChart({ data }: Props) {
  const chartData = {
    labels: data.map((d) => d.category.name),
    datasets: [
      {
        data: data.map((d) => d.total),
        backgroundColor: data.map((d) => d.category.color || "#888"),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <Pie data={chartData} />
    </div>
  );
}
