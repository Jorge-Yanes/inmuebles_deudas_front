import { NextRequest, NextResponse } from 'next/server';
import { v1 } from '@google-cloud/discoveryengine';

const client = new v1.SearchServiceClient();

const PROJECT_ID = 'deudas-inmobiliarias';
const DATA_STORE_ID = 'inmuebles_1748938854943';
const SERVING_CONFIG = `projects/${PROJECT_ID}/locations/global/collections/default_collection/dataStores/${DATA_STORE_ID}/servingConfigs/default_serving_config`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Execute search with optional filter, pagination, and query specs
    const [rawResponse] = await client.search({
      servingConfig: SERVING_CONFIG,
      query: body.query,
      // only include specs if provided
      ...(body.queryExpansionSpec ? { queryExpansionSpec: body.queryExpansionSpec } : {}),
      ...(body.spellCorrectionSpec ? { spellCorrectionSpec: body.spellCorrectionSpec } : {}),
      ...(body.filter ? { filter: body.filter } : {}),
      pageSize: body.pageSize || 10,
    });

    // Map results: extract structData or parse JSON content, preserve document ID
    const assets = rawResponse.results?.map((res: any) => {
      const document = res.document;
      let data: any = {};
      if (document?.structData && Object.keys(document.structData).length > 0) {
        data = document.structData;
      } else if (document?.content?.jsonData) {
        try {
          data = JSON.parse(document.content.jsonData);
        } catch (e) {
          console.warn('Failed to parse document.content.jsonData', e);
        }
      }
      // Use document.id if available, else fallback to res.id
      const id = document?.id || res.id;
      return { ...data, id };
    }) ?? [];

    return NextResponse.json({ assets });
  } catch (error: any) {
    console.error('Error en el endpoint /api/search:', error);

    return NextResponse.json(
      { error: 'Error en Vertex AI Search: ' + (error.message || 'Error desconocido') },
      { status: 500 }
    );
  }
}