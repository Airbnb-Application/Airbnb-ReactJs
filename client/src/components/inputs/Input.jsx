// import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import toast from "react-hot-toast";
import { BiDollar } from "react-icons/bi";
import { FiEyeOff } from "react-icons/fi";
import { FiEye } from "react-icons/fi";

const Input = (props) => {
  const {
    id,
    label,
    type,
    register,
    disabled,
    formatPrice,
    required,
    errors,
    validate,
    value,
    onChange,
    showPassword,
    setShowPassword,
  } = props;
  return (
    <div className="relative w-full">
      {formatPrice && (
        <BiDollar
          size={24}
          className="text-neutral-700 absolute top-5 left-2"
        />
      )}
      <input
        id={id}
        value={value}
        disabled={disabled}
        onChange={onChange}
        {...register(id, { required, validate })} // register the input and check if its not empty
        placeholder=" "
        type={type}
        className={`
                    peer
                    w-full 
                    p-4 
                    pt-6 
                    border-2
                    font-light 
                    bg-white 
                    rounded-md 
                    outline-none 
                    transition 
                    disabled:opacity-70
                    disabled:cursor-not-allowed
                    ${formatPrice ? "pl-9" : "pl-4"} 
                    ${errors[id] ? "border-rose-500" : "border-neutral-300"}
                    ${
                      errors[id]
                        ? "focus:border-rose-500"
                        : "focus:border-black"
                    }

                `}
      ></input>
      <label
        className={`
                absolute
                text-md
                duration-150 
                transform 
                -translate-y-3 
                top-5 
                z-10 
                origin-[0]
                ${formatPrice ? "left-9" : "left-4"} 
                peer-placeholder-shown:scale-100 
                peer-placeholder-shown:translate-y-0 
                peer-focus:scale-75 
                peer-focus:-translate-y-4
                ${errors[id] ? "text-rose-500" : "text-zinc-400"}
            `}
      >
        {label}
      </label>
      {errors[id]?.type === "checkEmailPattern" && (
        <p className="text-rose-500 font-semibold">Invalid email</p>
      )}
      {errors[id]?.type === "required" && (
        <p className="text-rose-500 font-semibold">This field is required</p>
      )}
      {errors[id]?.type === "checkPasswordPattern" && (
        <p className="text-rose-500 font-semibold">
          Password must contain at least 8 characters, one letter and one number
        </p>
      )}
      {(label === "Password" ||
        label === "Old password" ||
        label === "New password") && !showPassword && (
          <FiEyeOff
            size={24}
            className="text-neutral-400 absolute top-5 right-5"
            onClick={setShowPassword}
          />
        )}
      {(label === "Password" ||
        label === "Old password" ||
        label === "New password") && showPassword && (
          <FiEye
            size={24}
            className="text-neutral-400 absolute top-5 right-5"
            onClick={setShowPassword}
          />
        )}
    </div>
  );
};

export default Input;
