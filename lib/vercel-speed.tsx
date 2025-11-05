"use client"
import * as React from "react"

let Exported: React.ComponentType = () => null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Exported = require("@vercel/speed-insights/next").SpeedInsights as React.ComponentType
} catch {}

export const SpeedInsights = Exported


