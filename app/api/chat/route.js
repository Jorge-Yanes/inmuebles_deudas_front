// Importamos los clientes de Google Cloud necesarios
import { Firestore } from "@google-cloud/firestore";
import { VertexAI } from "@google-cloud/vertexai";
import { v1 } from "@google-cloud/discoveryengine";
const discoveryengineClient = new v1.SearchServiceClient();

// Leemos las variables de entorno necesarias
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const location = process.env.VERTEX_AI_LOCATION || "us-central1"; // Región por defecto
const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID || "(default)";
const vertexAiSearchDataStoreId = process.env.VERTEX_AI_SEARCH_DATA_STORE_ID;

import { auth } from 'google-auth-library';

const authClient = await auth.getClient();
const project = await auth.getProjectId();
console.log("✅ Autenticado en proyecto:", project);



if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  throw new Error("❌ GOOGLE_APPLICATION_CREDENTIALS_JSON no está definida.");
}

const parsedCredentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

// Verificamos que las variables clave estén definidas
if (
  !projectId ||
  !process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ||
  !vertexAiSearchDataStoreId
) {
  console.error("❌ Faltan variables de entorno requeridas.");
  // En producción deberías retornar un error HTTP aquí.
}

// 🔥 Inicializamos el cliente de Firestore
const firestore = new Firestore({
  projectId: projectId,
  databaseId: firestoreDatabaseId,
  credentials: parsedCredentials,
});

// 🤖 Inicializamos el cliente de Vertex AI
const vertex_ai = new VertexAI({
  project: projectId,
  location: location,
  credentials: parsedCredentials,
});

// 📦 Construimos el nombre completo del data store para las búsquedas
const dataStoreName = `projects/${projectId}/locations/global/collections/default_collection/dataStores/${vertexAiSearchDataStoreId}`;

// ✨ Creamos el modelo generativo Gemini-Pro
const generativeModel = vertex_ai.getGenerativeModel({
    model: 'gemini-2.0-flash-lite-001',
});

// Handler para el endpoint /api/chat (Next.js o API Route en App Router)
export async function POST(req) {
  const { query: userQuery } = await req.json();

  // Saludo inicial o mensaje vacío
  if (userQuery.trim() === "" || userQuery.toLowerCase().includes("hola")) {
    const bienvenida = `¡Hola! 👋 Un placer saludarte. 
¿En qué puedo ayudarte hoy a encontrar una propiedad? ¿Tienes alguna idea de lo que estás buscando? ¿Por ejemplo, te interesa comprar, alquilar, en qué zona te gustaría, qué tipo de propiedad tienes en mente (piso, casa, local comercial...)? Cuéntame un poco más sobre tus necesidades para poder ayudarte mejor. 😊`;

    return new Response(
      JSON.stringify({
        conversationalResponse: bienvenida,
        propertyResults: [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!userQuery) {
    return new Response(
      JSON.stringify({ error: "Missing user query in request body" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let conversationalResponse = "Lo siento, no pude procesar tu solicitud.";
  let propertyResults = [];
  let searchParameters = {};

  try {
    // 🧠 Paso 1: Gemini intenta extraer criterios de búsqueda
    const prompt = `Eres un asistente de IA que extrae criterios de búsqueda de propiedades a partir del mensaje del usuario. Tu respuesta debe ser un objeto JSON con posibles campos como "municipio_catastro", "minPrice", "maxPrice", "rooms", "Property Type". Si no se encuentran criterios o el usuario hace una pregunta que no se puede traducir directamente a criterios de búsqueda, devuelve un objeto JSON vacío {}. Solo incluye campos para los que el usuario haya proporcionado explícitamente un valor o rango.

Mensaje del usuario: "${userQuery}"

Salida JSON:
`;

    const geminiResponse = await generativeModel.generateContent(prompt);
console.log('🔍 Respuesta cruda desde Vertex AI:', JSON.stringify(geminiResponse, null, 2));
    const geminiText =
      geminiResponse.response.candidates[0]?.content?.parts[0]?.text;

    try {
      // Extraemos el JSON desde el texto generado por Gemini (puede tener ruido o formato suelto)
      const jsonMatch = geminiText.match(/\{.*\}/s);
      if (jsonMatch && jsonMatch[0]) {
        searchParameters = JSON.parse(jsonMatch[0]);
      } else {
        console.warn("⚠️ Gemini no devolvió JSON válido:", geminiText);
        const fallbackPrompt = `El usuario dijo: "${userQuery}". No pude extraer criterios de búsqueda específicos. Responde de manera conversacional, en español, y pídele más información. Usa formato Markdown para facilitar la lectura.`;
        const fallbackResponse = await generativeModel.generateContent(
          fallbackPrompt
        );
        conversationalResponse =
          fallbackResponse.response.candidates[0]?.content?.parts[0]?.text;
        return new Response(
          JSON.stringify({ conversationalResponse, propertyResults }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } catch (parseError) {
      console.error("❌ Error al parsear el JSON de Gemini:", parseError);
      console.log("Texto bruto de Gemini:", geminiText);
      const fallbackPrompt = `El usuario dijo: "${userQuery}". Hubo un error al procesar la solicitud. Genera una respuesta en español, amigable, pidiendo disculpas por el error. Usa Markdown para dar formato.`;
      const fallbackResponse = await generativeModel.generateContent(
        fallbackPrompt
      );
      conversationalResponse =
        fallbackResponse.response.candidates[0]?.content?.parts[0]?.text;
      return new Response(
        JSON.stringify({
          error: "Error processing query.",
          conversationalResponse,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 🔍 Paso 2: Si hay parámetros válidos, hacemos búsqueda en Vertex AI Search
    if (Object.keys(searchParameters).length > 0) {
      console.log("🔎 Parámetros de búsqueda extraídos:", searchParameters);

      const searchRequest = {
        servingConfig: `${dataStoreName}/servingConfigs/default_serving_config`,
        query: userQuery,
        queryExpansionSpec: { condition: "AUTO" },
        spellCorrectionSpec: { mode: "AUTO" },
        filter: buildVertexAISearchFilter(searchParameters),
      };

      console.log(
        "🛠 Enviando búsqueda a Vertex AI Search:",
        JSON.stringify(searchRequest, null, 2)
      );

      const [searchResponse] = await discoveryengineClient.search(
        searchRequest
      );

      // Extraemos los resultados del documento (según cómo configuraste la indexación)
      propertyResults =
        searchResponse.results
          ?.map((result) => {
            try {
              // Verifica que `result.document.content?.jsonData` exista
              const rawJson = result.document?.content?.jsonData;
              return rawJson ? JSON.parse(rawJson) : null;
            } catch (e) {
              console.error("❌ Error parseando resultado:", e);
              return null;
            }
          })
          .filter((item) => item !== null) || [];

      console.log(`✅ ${propertyResults.length} propiedades encontradas.`);

      // 🧠 Paso 3: Creamos una respuesta conversacional usando Gemini
      if (propertyResults.length > 0) {
        const resultSummaryPrompt = `El usuario busca propiedades basándose en: "${userQuery}". He encontrado ${
          propertyResults.length
        } propiedades. Aquí tienes un resumen de las primeras 3 para generar una respuesta conversacional en español (usa Markdown para formato):

  - Menciona cuántas propiedades se encontraron.
  - Resalta 2-3 características clave de cada una.
  - Termina animando al usuario a consultar más o a afinar su búsqueda.
  `;

        const conversationalResponseGen = await generativeModel.generateContent(
          resultSummaryPrompt
        );
        conversationalResponse =
          conversationalResponseGen.response.candidates[0]?.content?.parts[0]
            ?.text;
      } else {
        const noResultsPrompt = `El usuario buscó propiedades con el mensaje: "${userQuery}", pero no se encontraron resultados. Genera un mensaje conversacional y amable en español, explicando la situación y sugiriendo:
  
  - Probar con un presupuesto distinto.
  - Buscar en otra zona cercana.
  - Considerar un tipo de propiedad diferente.

  Usa formato Markdown para claridad.`;
        const noResultsResponse = await generativeModel.generateContent(
          noResultsPrompt
        );
        conversationalResponse =
          noResultsResponse.response.candidates[0]?.content?.parts[0]?.text;
      }
    } else {
      // No se identificaron parámetros de búsqueda: respuesta genérica
      const generalResponsePrompt = `El usuario dijo: "${userQuery}". No se identificaron criterios específicos de búsqueda. Responde en español, de forma conversacional, y pregúntale cómo puedes ayudarle a encontrar una propiedad. Usa formato Markdown.`;
      const generalResponse = await generativeModel.generateContent(
        generalResponsePrompt
      );
      conversationalResponse =
        generalResponse.response.candidates[0]?.content?.parts[0]?.text;
    }

    // ✅ Paso 4: Respondemos al frontend
    return new Response(
      JSON.stringify({
        conversationalResponse,
        propertyResults,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error general en el endpoint /api/chat:", error);

    try {
      const errorPrompt = `Hubo un error técnico al procesar la solicitud del usuario: "${userQuery}". Genera una respuesta conversacional en español, disculpándote por las molestias e invitando al usuario a intentarlo de nuevo más tarde. Usa formato Markdown.`;
      const errorResponseGen = await generativeModel.generateContent(
        errorPrompt
      );
      conversationalResponse =
        errorResponseGen.response.candidates[0]?.content?.parts[0]?.text;
    } catch (genError) {
      console.error("⚠️ Fallo generando respuesta de error:", genError);
      conversationalResponse =
        "Lo siento, ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde.";
    }

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        conversationalResponse,
        propertyResults: [],
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
// 🔧 Función auxiliar para construir el filtro de Vertex AI Search
function buildVertexAISearchFilter(params) {
    const filters = [];
  
    if (params.city) {
      filters.push(`municipio_catastro:"${params.city}"`);
    }
    if (params.minPrice) {
      filters.push(`price_approx >= ${params.minPrice}`);
    }
    if (params.maxPrice) {
      filters.push(`price_approx <= ${params.maxPrice}`);
    }
    if (params.bedrooms) {
      filters.push(`rooms >= ${params.bedrooms}`);
    }
    if (params.propertyType) {
      filters.push(`"Property Type":"${params.propertyType}"`);
    }
  
    return filters.join(" AND ");
  }