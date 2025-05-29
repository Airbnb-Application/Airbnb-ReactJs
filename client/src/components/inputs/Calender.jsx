import {DateRange, Range, RangeKeyDict} from "react-date-range";
import 'react-date-range/dist/styles.css'; // main style file   
import 'react-date-range/dist/theme/default.css'

const Calendar = (props) => {
    const {value, onChange, disabledDate, isReserve} = props;

    let defaultValue = value;
    if (isReserve) {
        const findNextAvailableDate = () => {
            let currentDate = new Date();

            // Duyệt qua các ngày và kiểm tra nếu ngày đó không bị disable
            while (disabledDate.some(date => date.toDateString() === currentDate.toDateString())) {
                currentDate.setDate(currentDate.getDate() + 1); // Tiến đến ngày tiếp theo
            }

            return currentDate;
        };

        // Thiết lập giá trị mặc định cho `value` là ngày gần nhất chưa bị disabled
        defaultValue = {
            startDate: findNextAvailableDate(),
            endDate: findNextAvailableDate(),
            key: 'selection'
        };
    }

    return (
        <DateRange
            rangeColors={['#262626']}
            ranges={[defaultValue]}
            date={new Date()}
            onChange={onChange}
            direction="vertical"
            showDateDisplay={false}
            minDate={new Date()}
            disabledDates={disabledDate}
        />
    )
}

export default Calendar;