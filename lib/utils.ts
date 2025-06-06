import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Asset } from "@/types/asset";
import {
  propertyTypeLabels,
  legalPhaseLabels,
  getFullAddress,
} from "@/types/asset";

/* ---------- Tailwind helper ---------- */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ---------- Normalizar texto ---------- */
export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/* ---------- Título y descripción ---------- */
export function generateTitle(asset: Asset): string {
  const type =
    propertyTypeLabels[asset.property_type] || asset.property_type || "Inmueble";
  const location =
    asset.municipio_catastro || asset.provincia_catastro || "ubicación desconocida";
  const size = asset.superficie_construida_m2
    ? `${asset.superficie_construida_m2}m²`
    : "";

  let title = `${type} en ${location}`;
  if (size) title += ` de ${size}`;
  if (asset.rooms) title += `, ${asset.rooms} hab.`;
  return title;
}

export function generateDescription(asset: Asset): string {
  const type =
    propertyTypeLabels[asset.property_type] || asset.property_type || "Inmueble";
  const address = getFullAddress(asset);

  let description = `${type} ubicado en ${address}, ${asset.municipio_catastro}, ${asset.provincia_catastro}.`;

  if (asset.superficie_construida_m2)
    description += ` Superficie construida de ${asset.superficie_construida_m2}m².`;
  if (asset.rooms) description += ` ${asset.rooms} habitaciones.`;
  if (asset.bathrooms) description += ` ${asset.bathrooms} baños.`;
  if (asset.extras) description += ` ${asset.extras}.`;
  if (asset.ano_construccion_inmueble && asset.ano_construccion_inmueble !== "0") {
    description += ` Año de construcción: ${asset.ano_construccion_inmueble}.`;
  }
  if (asset.legal_phase) {
    const phase = legalPhaseLabels[asset.legal_phase] || asset.legal_phase;
    description += ` Actualmente en fase legal: ${phase}.`;
  }
  return description;
}

/* ---------- Dirección y localización ---------- */
export function getFullAddress(asset: Asset): string {
  const parts: string[] = [];

  if (asset.tipo_via_catastro && asset.nombre_via_catastro) {
    let address = `${asset.tipo_via_catastro} ${asset.nombre_via_catastro}`;
    if (asset.numero_portal_catastro) address += ` ${asset.numero_portal_catastro}`;
    parts.push(address);
  }

  const details: string[] = [];
  if (asset.escalera_catastro) details.push(`Esc. ${asset.escalera_catastro}`);
  if (asset.planta_catastro) details.push(`Planta ${asset.planta_catastro}`);
  if (asset.puerta_catastro) details.push(`Puerta ${asset.puerta_catastro}`);
  if (details.length) parts.push(details.join(", "));

  return parts.join(", ") || "Dirección no disponible";
}

/* ---------- Formateadores ---------- */
export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export const formatNumber = (num: number) =>
  new Intl.NumberFormat("es-ES").format(num);

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

/* ---------- Mini-helpers usados por UI ---------- */
export const getPropertyType = (asset: Asset) =>
  asset.tipo_inmueble || asset.property_type || "Inmueble";

export const getSuperficie = (asset: Asset) =>
  asset.superficie_construida_m2?.toString() ||
  asset.surface_area?.toString() ||
  "N/A";

/* ---------- Valores de mercado ---------- */
export const calculateMarketValue = (a: Asset) => {
  const sup = Number.parseFloat(getSuperficie(a));
  return sup && a.precio_idealista_venta_m2 ? sup * a.precio_idealista_venta_m2 : 0;
};

export const calculateRentalMarketValue = (a: Asset) => {
  const sup = Number.parseFloat(getSuperficie(a));
  return sup && a.precio_idealista_alquiler_m2
    ? sup * a.precio_idealista_alquiler_m2
    : 0;
};

/* ---------- Map helpers ---------- */
export function getLocationForMap(asset: Asset) {
  const address = getFullAddress(asset);
  const postalCode = asset.codigo_postal_catastro || asset.zip_code || "";
  const city = asset.municipio_catastro || asset.city || "";
  const province = asset.provincia_catastro || asset.province || "";

  const fullLocation = [address, city, province, "España"].filter(Boolean).join(", ");

  let formattedAddress = "";
  if (asset.tipo_via_catastro && asset.nombre_via_catastro) {
    formattedAddress += `${asset.tipo_via_catastro} ${asset.nombre_via_catastro}`;
    if (asset.numero_portal_catastro)
      formattedAddress += ` ${asset.numero_portal_catastro}`;
  }
  if (asset.municipio_catastro)
    formattedAddress += formattedAddress
      ? `, ${asset.municipio_catastro}`
      : asset.municipio_catastro;
  if (asset.provincia_catastro)
    formattedAddress += formattedAddress
      ? `, ${asset.provincia_catastro}`
      : asset.provincia_catastro;
  if (asset.codigo_postal_catastro)
    formattedAddress += formattedAddress
      ? `, ${asset.codigo_postal_catastro}`
      : asset.codigo_postal_catastro;

  formattedAddress += formattedAddress ? ", España" : "España";

  return {
    address,
    postalCode,
    city,
    province,
    fullLocation,
    formattedAddress,
  };
}

export const generateGoogleMapsEmbedUrl = (location: string) =>
  `https://www.google.com/maps/embed/v1/place?key=${
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  }&q=${encodeURIComponent(location)}&zoom=15&maptype=roadmap`;

export const getCadastralMapUrl = (ref: string) =>
  `https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?refcat=${ref}`;

export function generateAssetInfoWindowContent(asset: Asset) {
  const address = getFullAddress(asset);
  const propertyType =
    propertyTypeLabels[asset.property_type] || asset.property_type;
  const superficie = getSuperficie(asset);

  return `
    <div style="max-width:300px;font-family:system-ui,-apple-system,sans-serif;">
      <h3 style="margin:0 0 8px;font-size:16px;font-weight:600;color:#1f2937">
        ${propertyType}
      </h3>
      <p style="margin:0 0 4px;font-size:14px;color:#6b7280">📍 ${address}</p>
      <p style="margin:0 0 4px;font-size:14px;color:#6b7280">
        🏙️ ${asset.municipio_catastro}, ${asset.provincia_catastro}
      </p>
      ${
        superficie !== "N/A"
          ? `<p style="margin:0 0 4px;font-size:14px;color:#6b7280">📐 ${superficie} m²</p>`
          : ""
      }
      ${
        asset.codigo_postal_catastro
          ? `<p style="margin:0 0 8px;font-size:14px;color:#6b7280">📮 ${asset.codigo_postal_catastro}</p>`
          : ""
      }
      ${
        asset.price_approx
          ? `<p style="margin:0;font-size:16px;font-weight:600;color:#059669">💰 ${formatCurrency(
              asset.price_approx,
            )}</p>`
          : ""
      }
    </div>
  `;
}