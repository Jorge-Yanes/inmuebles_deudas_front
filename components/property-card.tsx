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

    const {
        direccion,
        municipio_catastro,
        price_approx,
        rooms,
        metros_cuadrados,
        url_imagen,
        descripcion,
        ["Property Type"]: propertyType,
        // Access other relevant fields here, matching the Property interface
    } = property;

    // Basic formatting for currency
    const formattedPrecio = price_approx !== undefined && price_approx !== null
        ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price_approx)
        : 'Precio no disponible';

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
            {/* Property Image */}
            {url_imagen ? ( // Use ternary for conditional rendering
                <img
                    src={url_imagen}
                    alt={`Imagen de ${direccion || 'la propiedad'}`}
                    className="w-full h-48 object-cover"
                />
            ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                    No image available
                </div>
            )}

            {/* Property Details */}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {direccion || 'Dirección no disponible'}
                </h3>
                {municipio_catastro && <p className="text-sm text-gray-600 mb-2">{municipio_catastro}</p>}

                <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-600 font-bold text-md">{formattedPrecio}</span>
                    {rooms !== undefined && rooms !== null && (
                        <span className="text-gray-700 text-sm">{rooms} hab.</span>
                    )}
                </div>

                {propertyType && (
                    <p className="text-sm text-gray-500 mb-2">{propertyType}</p>
                )}

                {metros_cuadrados !== undefined && metros_cuadrados !== null && (
                    <p className="text-sm text-gray-600 mb-2">{metros_cuadrados} m²</p>
                )}

                {/* Optional: Short Description */}
                {descripcion && (
                    <div className="text-gray-700 text-sm leading-tight max-h-32 overflow-hidden text-ellipsis">
                        <ReactMarkdown>{descripcion}</ReactMarkdown>
                    </div>
                )}

                {/* Optional: Add a link */}
                {/* <div className="mt-4">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200">
                Ver detalles
            </button>
        </div> */}
            </div>
        </div>
    );
};

export default PropertyCard;
