import { Input, InputProps } from "@nextui-org/react";

type FormInputProps = InputProps & {
  label: string;
  unit?: string;
};

const FormInput = ({ label, unit, ...props }: FormInputProps) => {
  return (
    <Input
      label={label}
      placeholder=" "
      endContent={
        unit && (
          <div className="pointer-events-none flex items-center">
            <span className="text-small text-default-400">{unit}</span>
          </div>
        )
      }
      {...props}
    />
  );
};

export default FormInput;
