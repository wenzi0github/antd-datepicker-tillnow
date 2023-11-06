import React, { useMemo, useRef } from "react";
import { Button, DatePicker, Input } from "antd";
import type { DatePickerProps } from "antd";
import "./datepicker-till-now.less";
import dayjs from "dayjs";

interface DatepickerTillNow extends DatePickerProps {
  value?: any;
  tillNow?: boolean;
  onChange?: (date: any) => void;
  children?: any;
}

const tillNowConfig = {
  text: "至今",
};

/**
 * 带有至今按钮的日期选择器
 */
const DatepickerTillNow = (props: DatepickerTillNow) => {
  console.log("value", props);

  const ref = useRef<any>(null);

  // 点击至今按钮
  const handleClickSoFar = () => {
    const dd = dayjs();
    dd.tillNow = true;
    props?.onChange(dd);
    ref.current?.blur();
  };

  const handleChange = (value: dayjs.Dayjs) => {
    console.log("change", value);
    if (value) {
      value.tillNow = undefined;
    }
    props?.onChange(value);
  };

  const value = useMemo(() => {
    if (props?.value) {
      if (!dayjs.isDayjs(props.value)) {
        throw new Error("DatepickerTillNow's value is not dayjs");
      }
      if (props?.value.tillNow) {
        return tillNowConfig.text;
      }
      const formated = dayjs(props.value).format(props.format || "YYYY-MM-DD");
      return formated;
    }
    return undefined;
  }, [props?.value]);

  return (
    <div className="datepicker-till-now">
      <Input placeholder="结束日期" value={value} readOnly />
      <DatePicker
        showToday={false}
        {...props}
        onChange={handleChange}
        ref={ref}
        renderExtraFooter={() => (
          <div className="sofar-btn" style={{ textAlign: "center" }}>
            <Button type="link" onClick={handleClickSoFar}>
              {tillNowConfig.text}
            </Button>
          </div>
        )}
      />
    </div>
  );
};

const RangePicker = (props: any) => {
  const ref = useRef<any>(null);
  const firstDateRef = useRef<any>(null);

  // 点击至今按钮
  const handleClickSoFar = () => {
    const dd = dayjs();
    dd.tillNow = true;
    props?.onChange([firstDateRef.current, dd]);
    ref.current?.blur();
  };

  const value = useMemo(() => {
    if (Array.isArray(props.value)) {
      return props.value.map((item: dayjs.Dayjs) => {
        if (item) {
          if (item.tillNow) {
            return tillNowConfig.text;
          }
          return dayjs(item).format(props?.format || "YYYY-MM-DD");
        }
        return item;
      });
    }
    return [];
  }, [props?.value, props?.format]);

  return (
    <div className="datepicker-till-now datepicker-till-now-range">
      <Input placeholder="结束日期" value={value?.[1]} />
      <DatePicker.RangePicker
        showToday={false}
        {...props}
        onCalendarChange={(value) => {
          if (Array.isArray(value)) {
            firstDateRef.current = value[0];
          }
        }}
        ref={ref}
        renderExtraFooter={() => (
          <div
            className="sofar-btn"
            style={{
              textAlign: "center",
              width: "50%",
              transform: "translateX(100%)",
            }}
          >
            <Button type="link" onClick={handleClickSoFar}>
              {tillNowConfig.text}
            </Button>
          </div>
        )}
      />
    </div>
  );
};

DatepickerTillNow.RangePicker = RangePicker;

export default DatepickerTillNow;
