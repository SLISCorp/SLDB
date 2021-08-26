import React from "react";
import { removeEmojis } from "../helpers/commonHelpers";
import Error from "./errorMessage";
import { CInput } from "@coreui/react";
export default function Input ({
  className = "form-control",
  value,
  name,
  id,
  type = "text",
  error,
  disabled = false,
  onChange,
  placeholder,
  maxLength = 55,
  minLength = 3,
  onBlur,
  onFocus,
  onInput,
  size = "16",
  style,
}) {
  return (
    <div className="input-component">
      <CInput
        type={type}
        size={size}
        className={className}
        id={id}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        minLength={minLength}
        name={name}
        value={value}
        onBlur={onBlur}
        onFocus={onFocus}
        onInput={onInput}
        style={style}
        onChange={(evt) => {
          evt.target.value = evt.target.value.trimStart();
          evt.target.value = removeEmojis(evt.target.value);
          onChange(evt);
        }}
      />
      <Error text={error} />
    </div>
  );
}
