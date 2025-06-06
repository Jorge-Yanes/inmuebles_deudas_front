interface AssetGridItemProps {
  asset: {
    price_approx?: number
    superficie_construida_m2?: number
    municipio_catastro?: string
    // Add other asset properties here as needed
  } | null
}

export function AssetGridItem({ asset }: AssetGridItemProps) {
  if (!asset) {
    return null
  }

  // Asegurar que todas las propiedades del asset se manejen de forma segura:
  const price = asset.price_approx || 0
  const surface = asset.superficie_construida_m2 || 0
  const location = asset.municipio_catastro || "Ubicación no disponible"

  return (
    <div>
      <h3>Asset Details</h3>
      <p>Price: {price}</p>
      <p>Surface: {surface} m²</p>
      <p>Location: {location}</p>
    </div>
  )
}
