import { Button, InputNumber } from "antd";
import type { InputNumberProps } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import classNames from "classnames";
import React, { useMemo } from "react";
import "./number-up-down.less";

interface NumUpDownProps extends InputNumberProps {
  className?: string;
}

const NumberUpDown = (props: NumUpDownProps) => {
  const { minDisabled, maxDisabled } = useMemo(() => {
    const min = props.min ?? Number.MIN_SAFE_INTEGER;
    const max = props.max ?? Number.MAX_SAFE_INTEGER;

    const minDisabled =
      typeof props.value === "number" ? props.value <= min : false;
    const maxDisabled =
      typeof props.value === "number" ? props.value >= max : false;

    return { minDisabled, maxDisabled };
  }, [props.value, props.min, props.max]);

  const handleClick = (type: "plus" | "minus") => {
    const value = Number(props?.value || 0);
    const step = Number(props?.step || 1);
    const newValue = type === "plus" ? value + step : value - step;

    props?.onChange?.(newValue);
  };

  return (
    <div className={classNames("number-up-down-field", props.className)}>
      <Button
        className="change-btn"
        icon={<MinusOutlined />}
        type="text"
        disabled={minDisabled}
        onClick={() => handleClick("minus")}
      ></Button>
      <InputNumber {...props} />
      <Button
        className="change-btn"
        icon={<PlusOutlined />}
        type="text"
        disabled={maxDisabled}
        onClick={() => handleClick("plus")}
      ></Button>
    </div>
  );
};
export default NumberUpDown;
