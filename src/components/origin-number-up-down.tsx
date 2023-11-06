import React, { useMemo } from "react";
import { isNil } from "lodash";

const OriginNumberUpDown = (props: any) => {
  const { minDisabled, maxDisabled } = useMemo(() => {
    const min = props.min ?? Number.MIN_SAFE_INTEGER;
    const max = props.max ?? Number.MAX_SAFE_INTEGER;

    const minDisabled = isNil(props.value) ? false : props.value <= min;
    const maxDisabled = isNil(props.value) ? false : props.value >= max;

    return { minDisabled, maxDisabled };
  }, [props.value, props.min, props.max]);

  const handleClick = (type: "plus" | "minus") => {
    const value = Number(props?.value || 0);
    const step = Number(props?.step || 1);
    const newValue = type === "plus" ? value + step : value - step;

    props?.onChange?.(newValue);
  };

  return (
    <div>
      <button disabled={minDisabled} onClick={() => handleClick("minus")}>
        -
      </button>
      <input
        type="tel"
        value={props.value}
        onChange={(event) => props?.onChange(event.target.value)}
      />
      <button disabled={maxDisabled} onClick={() => handleClick("plus")}>
        +
      </button>
    </div>
  );
};
export default OriginNumberUpDown;
