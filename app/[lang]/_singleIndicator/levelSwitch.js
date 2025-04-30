import { Radio, RadioGroup } from "@headlessui/react";

export default function LevelSwitch({ options, handleChange, value }) {
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
            key={plan.value}
            value={plan}
            className="group relative flex cursor-pointer bg-white p-s transition  focus:not-data-focus:outline-none data-checked:bg-blue data-checked:text-white data-focus:outline data-focus:outline-white text-blue border-1 border-blue"
          >
            <p className="font-semibold uppercase description">{plan.name}</p>
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
}
