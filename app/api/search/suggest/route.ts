import { NextRequest, NextResponse } from 'next/server';
import { v1 } from '@google-cloud/discoveryengine';

// Vertex AI Search auto-completion via CompletionService
const completionClient = new v1.CompletionServiceClient();

// Replace with your project and data store IDs or use env vars
const PROJECT_ID = 'deudas-inmobiliarias';
const DATA_STORE_ID = 'inmuebles_1748938854943';
// For auto-completion, use the dataStore resource path (no collection)
const DATA_STORE = `projects/${PROJECT_ID}/locations/global/dataStores/${DATA_STORE_ID}`;

/**
 * GET /api/search/suggest?q=...
 * Returns query auto-complete suggestions from Vertex AI Search.
 */
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const query = url.searchParams.get('q') || '';
    if (!query.trim()) {
      return NextResponse.json({ suggestions: [] });
    }

    const request = {
      dataStore: DATA_STORE,
      query,
      pageSize: 8,
    };
    const [response] = await completionClient.completeQuery(request as any);
    // Extract suggestion strings
    const suggestions = Array.isArray(response.suggestions)
      ? response.suggestions.map(s => s.suggestion || '').filter(Boolean)
      : [];
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error in /api/search/suggest:', error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}