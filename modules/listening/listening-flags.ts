import type { StaticImageData } from "next/image";
import australiaFlag from "@/modules/listening/img/flag-for-flag-australia-svgrepo-com.svg";
import newZealandFlag from "@/modules/listening/img/flag-for-flag-new-zealand-svgrepo-com.svg";

function svgSrc(asset: StaticImageData): string {
  return asset.src;
}

export const LISTENING_FLAG_IMAGES = {
  australia: svgSrc(australiaFlag),
  newzealand: svgSrc(newZealandFlag),
} as const;
