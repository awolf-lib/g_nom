import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "../../App.css";

const Slider = ({
  getValue,
  label = "",
  min = 1,
  max = 100,
  showValues = false,
}: {
  getValue: Dispatch<SetStateAction<number>>;
  label?: string;
  min?: number;
  max?: number;
  showValues?: boolean;
}) => {
  const [value, setValue] = useState<number>(0);

  useEffect(() => {
    getValue(value);
  }, [value]);

  return (
    <div className="w-full">
      <label className="flex items-center w-full">
        {label && label}
        <input
          className={label ? "w-full mx-2" : "w-full"}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value))}
        />
      </label>
      {showValues && (
        <div className="flex justify-between text-xs font-thin">
          <div className="w-4">{min}</div>
          <div className="w-4">{value}</div>
          <div className="w-4">{max}</div>
        </div>
      )}
    </div>
  );
};

interface ISliderProps {
  label?: string;
}

export default Slider;
