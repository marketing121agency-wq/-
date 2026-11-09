import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Premium monochrome palette: deep black, warm white, brushed silver.
export const INK = "#0a0a0a";
export const PAPER = "#f4f3ef";
export const SILVER = "linear-gradient(180deg, #ffffff 0%, #cfcfcf 45%, #8d8d8d 100%)";

export const tall = "OswaldTall";
export const sans = "InterUpright";
loadFont({ family: tall, url: staticFile("fonts/oswald.woff2"), weight: "200 700" });
loadFont({ family: sans, url: staticFile("fonts/inter.woff2"), weight: "100 900" });

export const sec = (s: number) => Math.round(s * 30);
