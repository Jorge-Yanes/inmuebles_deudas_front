// Importamos los clientes de Google Cloud necesarios
import { Firestore } from "@google-cloud/firestore";
import { VertexAI } from "@google-cloud/vertexai";
import fs from "fs";
import { v1 } from "@google-cloud/discoveryengine";
const discoveryengineClient = new v1.SearchServiceClient();

// Leemos las variables de entorno necesarias
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const location = process.env.VERTEX_AI_LOCATION || "us-east1"; // Región por defecto
const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID || "(default)";
const vertexAiSearchDataStoreId = process.env.VERTEX_AI_SEARCH_DATA_STORE_ID; // Verify this is correct
import { auth } from 'google-auth-library';

let credentials = null;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON.trim();

  // If it starts with “{” we assume it is the JSON, not a path
  if (raw.startsWith("{")) {
    credentials = JSON.parse(raw);
  } else if (fs.existsSync(raw)) {
    credentials = JSON.parse(fs.readFileSync(raw, "utf8"));
  } else {
    console.error("❌ GOOGLE_APPLICATION_CREDENTIALS_JSON no es JSON ni path válido");
  }
}

export const gcpCredentials = credentials;

// Verificamos que las variables clave estén definidas
if (
  !projectId ||
  !vertexAiSearchDataStoreId
  // Eliminamos la verificación de GOOGLE_APPLICATION_CREDENTIALS_JSON como obligatoria aquí
  // ya que el cliente auth.getClient() debería manejar la autenticación
) {
  console.error("❌ Faltan variables de entorno requeridas: projectId o VERTEX_AI_SEARCH_DATA_STORE_ID.");
}

// 🔥 Inicializamos el cliente de Firestore (Puede que no lo necesites para este endpoint específico,
// pero lo mantengo si lo usas en otras partes del código)
const firestore = new Firestore({
  projectId: projectId,
  databaseId: firestoreDatabaseId,
});

// 🤖 Inicializamos el cliente de Vertex AI
const vertex_ai = new VertexAI({
  project: projectId,
  location: location,
});

// 📦 Construimos el nombre completo del data store para las búsquedas
const dataStoreName = `projects/${projectId}/locations/global/collections/default_collection/dataStores/${vertexAiSearchDataStoreId}`;
console.log("Data Store Name:", dataStoreName);


const generativeModel = vertex_ai.getGenerativeModel({
  model: 'gemini-2.0-flash-lite-001',
});


// Handler para el endpoint /api/chat (Next.js o API Route en App Router)
export async function POST(req) {
  const { query: userQuery } = await req.json();

  console.log("👤 User Query:", userQuery);

  if (userQuery.trim() === "" || userQuery.toLowerCase().includes("hola")) {
    const bienvenida = `¡Hola! 👋 Un placer saludarte.\n¿En qué puedo ayudarte hoy a encontrar una propiedad? ¿Tienes alguna idea de lo que estás buscando? ¿Por ejemplo, te interesa comprar, alquilar, en qué zona te gustaría, qué tipo de propiedad tienes en mente (piso, casa, local comercial...)? Cuéntame un poco más sobre tus necesidades para poder ayudarte mejor. 😊`;

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
      JSON.stringify({ error: "Falta la consulta del usuario en el cuerpo de la solicitud" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let conversationalResponse = "Lo siento, no pude procesar tu solicitud.";
  let propertyResults = [];
 
  let geminiResponseJson = null; // Variable para almacenar el JSON parseado de Gemini
  let action = "clarify"; // Por defecto si algo falla con Gemini, pedimos clarificación
  let clarificationQuestion = "Por favor, ¿podrías darme más detalles sobre lo que buscas?"; // Pregunta de fallback
  try {
      // 🧠 Paso 1: Gemini interpreta el query completo y decide la acción
      // Usamos backticks para un prompt multilinea más limpio
      const prompt = `Analyze the user's request for real estate properties. Your goal is to determine if a direct search can be performed using Vertex AI Search or if clarification from the user is needed to proceed effectively. You must provide a structured JSON response according to the specified format.

**Instructions:**
1. Read the user's message carefully to understand their intent and requirements regarding real estate.
2. Identify all key search criteria and relevant concepts mentioned, such as locations (specific cities, regions, neighborhoods, coastal areas like "costa de Huelva", or broader areas like "Andalucía"), property types (houses, apartments, commercial), price ranges, number of rooms/bedrooms/bathrooms, specific features (parking, proximity to beach or coast), and any other relevant intentions or criteria (e.g., "investment", "profitability", specific procedures like "auction", "rentable").
3. Decide the best course of action:
    - If you have enough clear and specific information to formulate a meaningful search query for Vertex AI Search AND potentially some strict filters (like a clear price range, exact number of bedrooms, or a very specific property type), set \`action\` to \`"search"\`.
    - If the request is ambiguous, too broad, lacks necessary specific details for an effective search (e.g., vague location, very general criteria like "inversión" without more context), or if you need to understand the user's needs better to provide relevant results, set \`action\` to \`"clarify"\` and formulate a precise \`clarificationQuestion\` for the user.
4. Structure your response as a JSON object with the following fields. **Ensure the output is ONLY the JSON object and nothing else.**
    - \`action\` (string): Must be either \`"search"\` or \`"clarify"\`.
    - \`searchQuery\` (string): If \`action\` is \`"search"\`, provide an optimized natural language query string for Vertex AI Search that captures the essence of the user's request, including locations, property types, and key concepts that Vertex AI Search's natural language processing can handle (e.g., "casas en la playa Huelva", "inmuebles rentables Madrid"). If \`action\` is \`"clarify"\`, this field must be an empty string \`""\`.
    - \`filters\` (object): If \`action\` is \`"search"\`, provide a JSON object containing key-value pairs for specific, strict criteria that can be directly mapped to filterable fields in the Data Store. **Only include fields here if the user provided a clear, quantifiable or strictly categorical value that is suitable for a precise filter.** Do NOT include broad concepts or general locations in filters. Examples of suitable filter criteria keys (use these keys if applicable): \`minPrice\`, \`maxPrice\`, \`bedrooms\`, \`bathrooms\`, \`has_parking\` (boolean/string), \`propertyType\` (specific type like "Apartamento", "Casa"). If no clear filterable parameters are found, this must be an empty object \`{}\`.
    - \`clarificationQuestion\` (string): If \`action\` is \`"clarify"\`, provide a clear, concise, and friendly question in **Spanish** to the user to gather the missing specific information needed to perform a search. If \`action\` is \`"search"\`, this field must be an empty string \`""\`.
    - \`extractedConcepts\` (array of strings): List any key concepts or criteria identified in the user's query that might be relevant, including locations (even if general), property types, features, and intentions (like "inversión", "rentabilidad", "playa", "costa", "Andalucía"). This field is for context and is not used directly for filtering.

**User Query:** "${userQuery}"

**JSON Output:**
\`\`\`json
{
  // Your JSON response here
}
\`\`\`
`;

    
    console.log("➡️ Prompt for Gemini (Analysis):", prompt);
    const geminiResponse = await generativeModel.generateContent(prompt);
    const geminiText = geminiResponse.response.candidates[0]?.content?.parts[0]?.text;

    console.log('🔍 Raw Response from Vertex AI (Gemini - Analysis):', geminiText);

    // Intentar parsear el JSON de la respuesta de Gemini
    try {
        // Limpiar el texto de Gemini para asegurar que sea JSON válido
        // Busca el primer '{' y el último '}' para extraer el JSON
        const jsonString = geminiText.substring(geminiText.indexOf('{'), geminiText.lastIndexOf('}') + 1);
        geminiResponseJson = JSON.parse(jsonString);
        console.log('✅ Parsed JSON from Gemini (Analysis):', geminiResponseJson);


        // Validar la estructura mínima de la respuesta de Gemini
        if (!geminiResponseJson || !geminiResponseJson.action) {
             throw new Error("Respuesta de Gemini inesperada o incompleta.");
        }

        action = geminiResponseJson.action;
        // Usar la pregunta de Gemini si está presente, de lo contrario usar fallback
        clarificationQuestion = geminiResponseJson.clarificationQuestion || "Lo siento, no entendí bien. ¿Podrías ser más específico?";

    } catch (parseError) {
      console.error("❌ Error al parsear o validar el JSON de Gemini (Análisis):", parseError);
      console.log("Texto bruto de Gemini:", geminiText);
       // Si falla el parseo o la validación, asumimos que necesita clarificación
       action = "clarify";
       clarificationQuestion = "Lo siento, ocurrió un error interno al procesar tu solicitud. ¿Podrías intentar de nuevo?"; // Pregunta de fallback
    }

        const searchQueryParams = geminiResponseJson.filters || {}; // Usamos los filtros proporcionados por Gemini
        const vertexAiSearchQuery = geminiResponseJson.searchQuery || userQuery; // Usamos el searchQuery optimizado o el original

        console.log("🔎 Filter parameters extracted by Gemini:", searchQueryParams);
        console.log("📝 Query for Vertex AI Search:", vertexAiSearchQuery);

        // Construimos el filtro solo con los parámetros que Gemini puso en 'filters'
        const filterString = buildVertexAISearchFilter(searchQueryParams);
        console.log("📊 Constructed Filter String:", filterString);


        const searchRequest = {
          servingConfig: `${dataStoreName}/servingConfigs/default_serving_config`,
          query: vertexAiSearchQuery,
          queryExpansionSpec: { condition: "AUTO" },
          spellCorrectionSpec: { mode: "AUTO" },
          filter: filterString,
        };


        console.log(
          "🛠 Sending search request to Vertex AI Search:",
          JSON.stringify(searchRequest, null, 2)
        );

        try {
          const searchResponseArray = await discoveryengineClient.search(searchRequest);

          // Log the full array returned by the client library
          console.log("➡️ Full array from discoveryengineClient.search:", searchResponseArray);
          
          // The actual results array is the first element of the returned array
          const resultsArray = searchResponseArray[0];
          
          // Log the actual results array
          console.log("➡️ Actual results array:", resultsArray);
          
          
          // Filter the results array directly
          const documentResults = resultsArray.filter( // Filter the resultsArray
            (result) => result && result.document && result.document.structData
          );
          
          console.log("➡️ Filtered documentResults array:", documentResults);
          
          
          propertyResults =
                    documentResults // Map over the filtered array
                      .map((result) => {
                        try {
                          // Access document directly from the result item
                          const propertyData = result.document.structData.fields;
          
          
                          if (propertyData) {
                             console.log("✨ Successfully extracted property data:", propertyData);
                             // ... rest of processing logic ...
                             const simplifiedProperty = {};
                             for (const key in propertyData) {
                                 const field = propertyData[key];
                                 if (field.kind === 'numberValue') {
                                     simplifiedProperty[key] = field.numberValue;
                                 } else if (field.kind === 'stringValue') {
                                     simplifiedProperty[key] = field.stringValue;
                                 }
                                 // Add other kinds if necessary
                             }
          
                             console.log("➡️ Simplified property object:", simplifiedProperty);
          
                             return simplifiedProperty;
                          }
                          console.warn("⚠️ Search result with missing or invalid structData.fields:", result);
                          return null;
                        } catch (e) {
                          console.error("❌ Error processing search result:", e);
                          return null;
                        }
                      })
                      .filter((item) => item !== null) || [];
          
          
console.log("📦 Final propertyResults array before count:", propertyResults);
console.log(`✅ Found ${propertyResults.length} properties.`);

          
        } catch (searchError) {
             console.error("❌ Error during Vertex AI Search:", searchError);
             // You might want to set a specific conversational response for search errors
             conversationalResponse = "Lo siento, hubo un problema al realizar la búsqueda. Por favor, intenta de nuevo.";
             // Re-throw or handle appropriately
             throw searchError; // Re-throw to be caught by the main catch block
        }


        let conversationalPromptForGemini;

        // Incluimos los conceptos extraídos por Gemini en el prompt para que los considere
        // y damos instrucciones para que mencione rentabilidad/inversión si son relevantes
        const extractedConceptsSummary = geminiResponseJson.extractedConcepts && geminiResponseJson.extractedConcepts.length > 0
        ? `Key concepts identified: ${geminiResponseJson.extractedConcepts.join(', ')}.`
        : '';

    // Combine the prompts to always include search results info
    conversationalPromptForGemini = `The user\'s original request was: \"${userQuery}\". ${extractedConceptsSummary} I performed a search with the query \"${vertexAiSearchQuery}\" and found ${
      propertyResults.length
    } properties. Here is the data for the first few results (up to 3) including relevant fields like location, price, rooms, property type, and any information related to concepts like profitability or investment if available in the data. Ensure the summary is concise but highlights key features relevant to the user\'s original request:\n${JSON.stringify(propertyResults.slice(0, Math.min(propertyResults.length, 3)), null, 2)}\n\nBased on the original request, the identified concepts (like \"investment\", \"profitability\", \"beach\", \"coast\"), and the search results, generate a friendly, helpful, and conversational response in **Spanish** to the user.\n- If properties were found, summarize the findings, mentioning how many properties were found, and highlight relevant properties from the top results.\n- If no properties were found, inform the user and suggest trying different criteria, clarifying their needs, or asking about different areas or features, based on the concepts identified in their original query.\n- If concepts like \"investment\" or \"profitability\" were identified in the user\'s query or extracted concepts, and the search results contain relevant data, mention how these properties might be relevant for investment, referencing the data provided.\n- If the user's query was somewhat vague or could benefit from refinement, ask a clarifying question in the context of the search results (or lack thereof) to help them narrow down their options.`;


     console.log("➡️ Prompt for Gemini (Conversational Response):", conversationalPromptForGemini);

     const conversationalResponseGen = await generativeModel.generateContent(
       conversationalPromptForGemini
     );

     conversationalResponse = conversationalResponseGen.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
                              "Lo siento, no pude generar una respuesta conversacional en este momento.";

     console.log("💬 Conversational response generated:", conversationalResponse);


    return new Response(
      JSON.stringify({
        conversationalResponse,
        propertyResults, // Always return propertyResults
        action: "search", // Action will always be 'search' in this new flow
        extractedConcepts: geminiResponseJson.extractedConcepts || []
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );


  } catch (error) {
    console.error("❌ General error in /api/chat endpoint:", error);

    // Generamos una respuesta de error conversacional usando Gemini
    try {
      const errorPrompt = `There was a technical issue processing the user\'s request: \"${userQuery}\". Generate a friendly, conversational message in **Spanish** apologizing for the inconvenience and asking them to try again later.`;
      const errorResponseGen = await generativeModel.generateContent(
        errorPrompt
      );
      // Extraer el texto de la respuesta de error, manejando posibles errores
      conversationalResponse = errorResponseGen.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
                               "Lo siento, ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde.";

    } catch (genError) {
      console.error("⚠️ Failed to generate conversational error response:", genError);
      conversationalResponse =
        "Lo siento, ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde.";
    }

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        conversationalResponse,
        propertyResults: [],
        action: "error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}


// 🔧 Función auxiliar para construir el filtro de Vertex AI Search
// Ahora esta función construye el filtro basándose **únicamente** en los parámetros
// que Gemini haya decidido incluir en el JSON 'filters'.
function buildVertexAISearchFilter(params) {
  const filters = [];

  // Mapeo de las claves que Gemini puede devolver en 'filters'
  // a los nombres de campo EXACTOS en tu esquema de Vertex AI Search.
  // ASEGÚRATE de que estas claves y nombres de campo coincidan con tu Data Store
  // y con lo que le instruyes a Gemini que devuelva en su campo 'filters'.
  const filterFieldMap = {
    ano_construccion_inmueble: "ano_construccion_inmueble",
    auction_base: "auction_base",
    auction_value: "auction_value",
    bathrooms: "bathrooms",
    cadastral_reference: "cadastral_reference",
    campania: "campania",
    closing_date: "closing_date",
    codigo_postal_catastro: "codigo_postal_catastro",
    descripcion: "descripcion",
    direccion_texto_catastro: "direccion_texto_catastro",
    escalera_catastro: "escalera_catastro",
    estado_posesion_fisica: "estado_posesion_fisica",
    fase_actual: "fase_actual",
    fase_procedimiento: "fase_procedimiento",
    fecha_cesion_remate: "fecha_cesion_remate",
    fecha_subasta: "fecha_subasta",
    gbv: "gbv",
    has_parking: "has_parking",
    hip_und_re_mgmt: "hip_under_re_mgmt",
    hipoges_value_total: "hipoges_value_total",
    id_portal_subasta: "id_portal_subasta",
    lien: "lien",
    marketing_status: "marketing_status",
    marketing_suspended_reason: "marketing_suspended_reason",
    municipio_catastro: "municipio_catastro",
    nombre_via_catastro: "nombre_via_catastro",
    numero: "numero",
    numero_portal_catastro: "numero_portal_catastro",
    parcela_catastro: "parcel_catastro",
    planta_catastro: "planta_catastro",
    portfolio: "portfolio",
    portfolio_closing_date: "portfolio_closing_date",
    precio_idealista_alquiler_m2: "precio_idealista_alquiler_m2",
    precio_idealista_venta_m2: "precio_idealista_venta_m2",
    price_approx: "price_approx",
    price_to_brokers: "price_to_brokers",
    property_bank_id: "property_bank_id",
    property_id: "property_id",
    property_idh: "property_idh",
    property_type: "property_type",
    provincia_catastro: "provincia_catastro",
    puerta_catastro: "puerta_catastro",
    purchase_price: "purchase_price",
    reference_code: "reference_code",
    registration_status: "registration_status",
    rooms: "rooms",
    sqm: "sqm",
    superficie_construida_m2: "superficie_construida_m2",
    tipo_procedimiento: "tipo_procedimiento",
    tipo_via_catastro: "tipo_via_catastro",
    minPrice: "precio_idealista_venta_m2",
    maxPrice: "precio_idealista_venta_m2"
};


  for (const key in params) {
    const value = params[key];
    const field = filterFieldMap[key]; // Obtenemos el nombre exacto del campo para el filtro

    if (!field || value === undefined || value === null) continue;

    // Construimos la parte del filtro según el tipo de valor y la clave
    if (typeof value === 'number') {
       // Lógica para rangos o igualdad de números según la clave
       if (key === 'minPrice') {
            filters.push(`${field} >= ${value}`);
       } else if (key === 'maxPrice') {
            filters.push(`${field} <= ${value}`);
       } else if (key === 'bedrooms') {
            filters.push(`${field} >= ${value}`); // Filtrar por al menos N habitaciones
       } else if (key === 'bathrooms') {
            filters.push(`${field} >= ${value}`); // Filtrar por al menos N baños
       }
       // Añade lógica para otros campos numéricos si Gemini los extrae como números exactos
       // else { filters.push(`${field} = ${value}`); }
    } else if (typeof value === 'string') {
       // Para campos string/texto que Gemini identifica como filtrables, usamos ANY()
       // Asegúrate de que el valor del string no sea vacío
       if (value.trim() !== '') {
         filters.push(`${field}: ANY(\"${value.trim()}\")`);
       }
    } else if (typeof value === 'boolean' && key === 'has_parking') {
        // Manejar booleanos si tienes campos booleanos filtrables
        filters.push(`${field} = ${value}`);
    }
    // Si Gemini extrae rangos para alguna clave, necesitarías añadir lógica aquí.
    // Ejemplo: { superficie: { min: 50, max: 100 } }
    // else if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
    //   const min = typeof value.min === 'number' ? value.min : parseFloat(value.min);
    //   const max = typeof value.max === 'number' ? value.max : parseFloat(value.max);
    //   if (!isNaN(min) && !isNaN(max)) {
    //       filters.push(`${field} >= ${min} AND ${field} <= ${max}`);
    //   } else if (!isNaN(min)) {
    //       filters.push(`${field} >= ${min}`);
    //   } else if (!isNaN(max)) {
    //        filters.push(`${field} <= ${max}`);
    //   }
    // }
  }

   if (filters.length === 0) {
       return ''; // Retorna una cadena vacía si no hay filtros
   }
  return filters.join(" AND ");
}
