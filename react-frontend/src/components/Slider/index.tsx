import { Dispatch, SetStateAction } from "react";
import "../../App.css";

const Slider = ({
  value,
  getValue,
  label = "",
  min = 0,
  max = 100,
  showValues = false,
}: {
  value?: number;
  getValue: Dispatch<SetStateAction<number>>;
  label?: string;
  min?: number;
  max?: number;
  showValues?: boolean;
}) => {
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
          onChange={(e) => getValue(parseInt(e.target.value))}
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

export default Slider;
