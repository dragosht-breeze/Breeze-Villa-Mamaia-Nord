"use client";

import NTPLogo from "ntp-logo-react";

export default function NetopiaLogo() {
  return (
    <div className="h-[50px] w-[250px]">
      <NTPLogo color="#071B2D" version="orizontal" secret="168939" />
    </div>
  );
}
