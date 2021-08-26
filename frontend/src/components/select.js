import React from "react";
import { removeEmojis } from "../helpers/commonHelpers";
import Error from "./errorMessage";
import { CSelect } from "@coreui/react";
export default function Select({
  className = "form-control",
  value,
  title,
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
  style,
  optionList = [],
}) {
  return (
    <div className="input-component">
      <CSelect
        className={className}
        disabled={disabled}
        value={value || ""}
        name={name}
        onBlur={onBlur}
        onFocus={onFocus}
        onInput={onInput}
        style={style}
        onChange={(evt) => {
          evt.target.value = evt.target.value.trimStart();
          evt.target.value = removeEmojis(evt.target.value);
          onChange(evt);
        }}
      >
        <option value={""}>{title}</option>
        {optionList.map((ele) => {
          return (
            <option value={ele.value} key={ele.label}>
              {ele.label}
            </option>
          );
        })}
      </CSelect>
      <Error text={error} />
    </div>
  );
}
