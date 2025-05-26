import { Radio, RadioGroup } from "@headlessui/react";

export default function LevelSwitch({ options, handleChange, value, disabled=false }) {
  return (
    <div className="">
      <RadioGroup
        by="name"
        value={value}
        onChange={handleChange}
        aria-label="Level selection"
        className="flex  border-blue border-1"
      >
        {options.map((plan) => (
          <Radio
            disabled={plan.disabled}
            key={plan.value}
            value={plan}
            className={`group relative flex  p-s transition  focus:not-data-focus:outline-none data-checked:bg-blue data-checked:text-white data-focus:outline data-focus:outline-white text-blue border-1 border-blue ${plan.disabled ? "bg-[#97abc4] text-navy cursor-not-allowed" : "bg-white  cursor-pointer"}`}
          >
            <p className="font-semibold uppercase description">{plan.name}</p>
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
}
