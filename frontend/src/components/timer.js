import React, { useEffect, useState } from 'react';
var Interval;
export default function Countdown({ counter, onFinish, style = 'timer' }) {
  // console.log(counter)
  const [value, setValue] = useState(counter);
  useEffect(() => {

    Interval = setInterval(() => {
      var diff = counter;
      // var days = Math.floor(counter / (3600 * 24));
      // var hours = Math.floor((counter - (days * (3600 * 24))) / 3600);
      // var minutes = Math.floor((counter - (days * (3600 * 24)) - (hours * 3600)) / 60);
      // var seconds = Math.floor(counter - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));
      var years = Math.floor((diff) / (60 * 60 * 24 * 365));
      diff = Math.floor((diff) % (60 * 60 * 24 * 365));
      var months = Math.floor((diff) / (60 * 60 * 24 * 30));
      diff = Math.floor((diff) % (60 * 60 * 24 * 30));
      var days = Math.floor((diff) / (60 * 60 * 24));
      diff = Math.floor((diff) % (60 * 60 * 24));
      var hours = Math.floor((diff) / (60 * 60));
      diff = Math.floor((diff) % (60 * 60));
      var minutes = Math.floor((diff) / (60));
      diff = Math.floor((diff) % (60));
      var seconds = Math.floor((diff) % (60));

      years = years < 10 ? "0" + years : years;
      months = months < 10 ? "0" + months : months;
      days = days < 10 ? "0" + days : days;
      hours = hours < 10 ? "0" + hours : hours;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      var d = years + "Y " + months + "M " + days + "D " + hours + "H " + minutes + "M " + seconds + "S ";
      setValue(d);
      if (--counter < 0) {
        setValue("Expired")
        onFinish();
      }
    }, 1000);
    return () => {
      clearInterval(Interval);
    };
  }, [counter]);

  return <span>{value}</span>;
}
