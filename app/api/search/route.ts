import { NextRequest, NextResponse } from 'next/server';
import { v1 } from '@google-cloud/discoveryengine';
import { Asset } from '@/types/asset'; // Assuming your Asset type is defined here

const client = new v1.SearchServiceClient();

const defaultAsset: Asset = {
  tipo_via_catastro: null,
  nombre_via_catastro: null,
  codigo_postal_catastro: null,
  municipio_catastro: null,
  provincia_catastro: null,
  cadastral_reference: null,
  property_type: null,
  superficie_construida_m2: null,
  ano_construccion_inmueble: null,
  price_approx: null,
  precio_idealista_venta_m2: null,
  precio_idealista_alquiler_m2: null,
};

const PROJECT_ID = 'deudas-inmobiliarias';
const DATA_STORE_ID = 'inmuebles_1748938854943';
const SERVING_CONFIG = `projects/${PROJECT_ID}/locations/global/collections/default_collection/dataStores/${DATA_STORE_ID}/servingConfigs/default_serving_config`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Cuerpo de la solicitud recibido en /api/search:', JSON.stringify(body, null, 2));

    const searchRequest = {
      servingConfig: SERVING_CONFIG,
      query: body.query,
      // only include specs if provided
      ...(body.queryExpansionSpec ? { queryExpansionSpec: body.queryExpansionSpec } : {}),
      ...(body.spellCorrectionSpec ? { spellCorrectionSpec: body.spellCorrectionSpec } : {}),
      ...(body.filter ? { filter: body.filter } : {}),
      pageSize: body.pageSize || 10,
    };

    console.log('Search Request:', JSON.stringify(searchRequest, null, 2));

    // Execute search with optional filter, pagination, and query specs
    const [rawResponse] = await client.search(searchRequest);
    console.log("RAW response from Vertex AI Search:", JSON.stringify(rawResponse, null, 2));

    // Determine results array: some responses may return an array directly
    const resultsArray = Array.isArray(rawResponse) 
      ? rawResponse 
      : rawResponse.results ?? [];

    if (!resultsArray || resultsArray.length === 0) {
      console.warn('No se encontraron resultados en la respuesta de Vertex Search');
    } else {
      console.log("Número de documentos en respuesta de Vertex:", resultsArray.length);
      console.log("Primer elemento en resultsArray (debug):", JSON.stringify(resultsArray[0], null, 2));
    }

    const assets = resultsArray.map((res: any) => {
      const document = res.document;
      let data: any = {};

      // DEBUG: Imprimir documento recibido (el objeto fields o vacío)
      console.log("Documento recibido:", JSON.stringify(document?.structData?.fields || {}, null, 2));

      if (document?.structData?.fields) {
        // Extract data from structData.fields and flatten it
        for (const fieldName in document.structData.fields) {
          const field = document.structData.fields[fieldName];
          if (field) {
            // Detect type dynamically
            if ('stringValue' in field) {
              data[fieldName] = field.stringValue;
            } else if ('numberValue' in field) {
              data[fieldName] = field.numberValue;
            } else if ('boolValue' in field) {
              data[fieldName] = field.boolValue;
            } else if ('listValue' in field) {
              data[fieldName] = field.listValue?.values?.map((v: any) => {
                if ('stringValue' in v) return v.stringValue;
                if ('numberValue' in v) return v.numberValue;
                return null;
              }) ?? [];
            } else {
              data[fieldName] = null;
            }
          }
        }
      } else if (document?.content?.jsonData) {
        try {
          data = JSON.parse(document.content.jsonData);
        } catch (e) {
          console.warn('Failed to parse document.content.jsonData', e);
        }
      }

      // Use document.id if available, else fallback to res.id
      const id = document?.id || res.id;

      // Dinámicamente crear el objeto Asset usando defaultAsset como plantilla
      const asset: Asset = Object.fromEntries(
        Object.keys(defaultAsset).map((key) => [key, data[key] ?? null])
      ) as Asset;

      return asset;
    }) ?? [];

    if (assets.length === 0) {
      console.warn('No se generaron assets tras el mapeo');
    }
    console.log('Assets generados después del mapeo:', JSON.stringify(assets, null, 2));
    return NextResponse.json({ assets });
  } catch (error: any) {
    console.error('Error en el endpoint /api/search:', error);

    return NextResponse.json(
      { error: 'Error en Vertex AI Search: ' + (error.message || 'Error desconocido') },
      { status: 500 }
    );
  }
}

// Si tienes una función flattenFirestoreFields, añade el log antes del return:
// Ejemplo:
// function flattenFirestoreFields(fields: any): any {
//   ... // lógica
//   console.log("Datos aplanados:", flattened);
//   return flattened;
// }
