import React from "react";
import styles from "../../app/page.module.css";

interface Props {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onFetch: () => void;
  isFetching: boolean;
  isFetchDisabled: boolean;
}

const DateRangeSelector: React.FC<Props> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onFetch,
  isFetching,
  isFetchDisabled,
}) => (
  <section className={styles.section}>
    <h4>Select Date Range:</h4>
    <div className={styles.dateRangeContainer}>
      <div className={styles.dateInputGroup}>
        <label htmlFor="startDate">Start Date: </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className={styles.dateInput}
        />
      </div>
      <div className={styles.dateInputGroup}>
        <label htmlFor="endDate">End Date: </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className={styles.dateInput}
        />
      </div>
    </div>
    <button
      onClick={onFetch}
      disabled={isFetching || isFetchDisabled}
      className={styles.button}
    >
      {isFetching ? "Fetching Transactions..." : "Get Transactions"}
    </button>
  </section>
);

export default DateRangeSelector;
