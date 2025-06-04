// components/PropertyCard.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';


// Define an interface for the property data structure
interface Property {
    direccion?: string;
    municipio_catastro?: string;
    price_approx?: number;
    rooms?: number;
    metros_cuadrados?: number;
    url_imagen?: string;
    descripcion?: string;
    ["Property Type"]?: string;
    // Add types for any other fields you use from your property data
    [key: string]: any; // Allow for other properties not explicitly listed
}

interface PropertyCardProps {
    property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
    if (!property) {
        return null; // Or a placeholder card indicating missing data
    }

    // Nuevo layout con campos clave y fallbacks
    return (
        <div className="border p-4 rounded-md shadow-md bg-white space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">
            {property.direccion_texto_catastro || 'Dirección no disponible'}
          </h3>
          <p className="text-sm text-gray-600">
            {property.municipio_catastro || ''}, {property.provincia_catastro || ''}
          </p>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <p><strong>Tipo:</strong> {property.property_type || property['Property Type'] || 'N/D'}</p>
            <p><strong>Superficie:</strong> {property.sqm ? `${property.sqm} m²` : property.superficie_construida_m2 || 'N/D'}</p>
            <p><strong>Habitaciones:</strong> {property.rooms || 'N/D'}</p>
            <p><strong>Baños:</strong> {property.bathrooms || 'N/D'}</p>
            <p><strong>Precio aprox.:</strong> {property.price_approx ? `${property.price_approx.toLocaleString()} €` : 'N/D'}</p>
            <p><strong>Subasta:</strong> {property.fecha_subasta || 'N/D'}</p>
            <p><strong>Fase actual:</strong> {property.fase_actual || 'N/D'}</p>
            <p><strong>Deuda total:</strong> {property.deuda || property.DEUDA || 'N/D'}</p>
          </div>

          {/* Rentabilidad estimada */}
          {typeof property.hipoges_value_total === 'number' && typeof property.purchase_price === 'number' && (
            <div style={{ marginTop: '8px', padding: '6px', backgroundColor: '#e0f7e9', borderRadius: '5px', color: '#146c43' }}>
              <strong>Rentabilidad estimada:</strong> {(((property.hipoges_value_total - property.purchase_price) / property.purchase_price) * 100).toFixed(1)}%
            </div>
          )}

          {/* Aviso de subasta próxima */}
          {property.fecha_subasta && (() => {
            const auctionDate = new Date(property.fecha_subasta);
            const today = new Date();
            // Reset time for today to midnight to avoid hour diffs
            today.setHours(0,0,0,0);
            auctionDate.setHours(0,0,0,0);
            const diffDays = Math.floor((auctionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 15) {
              return (
                <div style={{ marginTop: '8px', padding: '6px', backgroundColor: '#fff3cd', borderRadius: '5px', color: '#856404' }}>
                  ⏰ <strong>¡Subasta próxima en {diffDays} días!</strong>
                </div>
              );
            }
            return null;
          })()}

          {property.descripcion && (
            <p className="text-sm text-gray-600 mt-2">
              {property.descripcion.slice(0, 200)}...
            </p>
          )}
        </div>
    );
};

export default PropertyCard;
