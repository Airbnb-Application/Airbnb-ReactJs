import { useMemo } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css";

const Calendar = (props) => {
  const { value, onChange, disabledDate, isReserve } = props;

  // Use useMemo to compute the range value and avoid unnecessary recalculations
  const rangeValue = useMemo(() => {
    if (!value || !value.startDate) {
      // If no value is provided, create a default range
      const findNextAvailableDate = () => {
        let currentDate = new Date();

        // Skip through disabled dates if any
        if (Array.isArray(disabledDate) && disabledDate.length > 0) {
          while (
            disabledDate.some(
              (date) =>
                date instanceof Date &&
                date.toDateString() === currentDate.toDateString()
            )
          ) {
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }

        return currentDate;
      };

      const availableDate = findNextAvailableDate();
      return {
        startDate: availableDate,
        endDate: availableDate,
        key: "selection",
      };
    }

    // Return the provided value
    return {
      startDate: new Date(value.startDate),
      endDate: new Date(value.endDate),
      key: "selection",
    };
  }, [value, disabledDate]);

  // Make sure disabledDates is always an array of Date objects
  const processedDisabledDates = useMemo(() => {
    if (!Array.isArray(disabledDate)) {
      return [];
    }

    return disabledDate.filter((date) => date instanceof Date);
  }, [disabledDate]);

  return (
    <div className="w-full">
      <DateRange
        rangeColors={["#262626"]}
        ranges={[rangeValue]} // Always use the computed range value
        date={new Date()}
        onChange={onChange}
        direction="vertical"
        showDateDisplay={false}
        minDate={new Date()}
        disabledDates={processedDisabledDates}
        months={1}
        preventSnapRefocus={true}
        editableDateInputs={true}
        moveRangeOnFirstSelection={false}
      />
    </div>
  );
};

export default Calendar;
