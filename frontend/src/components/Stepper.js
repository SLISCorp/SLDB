import React from "react";
export default function Stepper({ steps = [] }) {
  return (
    <div className="bs-stepper">
      <div className="bs-stepper-header" role="tablist">
        {/* your steps here */}
        {steps.map((ele, index) => {
          return (
            <>
              <div key={index + 1}
                className={`step ${ele.active ? "active" : ""}`}
                data-target="#logins-part"
              >
                <div
                  type="button"
                  className="step-trigger"
                  role="tab"
                  aria-controls="logins-part"
                  id="logins-part-trigger"
                >
                  <span className="bs-stepper-circle">{index + 1}</span>
                  <span className="bs-stepper-label">{ele.label}</span>
                </div>
              </div>
              {steps.lastIndex !== index && <div className="line" />}
            </>
          );
        })}
      </div>
    </div>
  );
}
