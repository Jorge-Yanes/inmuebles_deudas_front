// Importamos los clientes de Google Cloud necesarios
import { Firestore } from "@google-cloud/firestore";
import { VertexAI } from "@google-cloud/vertexai";
import fs from "fs";
import { v1 } from "@google-cloud/discoveryengine";
const discoveryengineClient = new v1.SearchServiceClient();

// Leemos las variables de entorno necesarias
//const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
//const location = process.env.VERTEX_AI_LOCATION || "us-east1"; // Región por defecto
const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID || "(default)";
//const vertexAiSearchDataStoreId = process.env.VERTEX_AI_SEARCH_DATA_STORE_ID;
const projectId = 'deudas-inmobiliarias';
const location = process.env.VERTEX_AI_LOCATION || "us-east1"; // Usa la región de tu Data Store
const vertexAiSearchDataStoreId = 'inmuebles_1748938854943';


import { auth } from 'google-auth-library';

/*const credentialsJSON = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (!credentialsJSON) {
  throw new Error("❌ Falta la variable de entorno GOOGLE_APPLICATION_CREDENTIALS_JSON.");
}

const auth = new GoogleAuth({
  credentials: JSON.parse(credentialsJSON),
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

const authClient = await auth.getClient();
const project = await auth.getProjectId();
console.log("✅ Autenticado en proyecto:", project);*/


console.log(
  "GOOGLE_APPLICATION_CREDENTIALS:",
  process.env.GOOGLE_APPLICATION_CREDENTIALS
);

// Comprobamos si el archivo de credenciales existe si la variable está definida
if (process.env.GOOGLE_APPLICATION_CREDENTIALS && !fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
  console.error(
    "❌ Archivo de credenciales no encontrado. Verifica la ruta GOOGLE_APPLICATION_CREDENTIALS."
  );
  // Dependiendo de tu configuración, podrías querer lanzar un error fatal aquí,
  // pero por ahora solo lo registramos.
}

// Verificamos que las variables clave estén definidas
if (
  !projectId ||
  !vertexAiSearchDataStoreId
  // Eliminamos la verificación de GOOGLE_APPLICATION_CREDENTIALS como obligatoria aquí
  // ya que el cliente auth.getClient() debería manejar la autenticación
) {
  console.error("❌ Faltan variables de entorno requeridas: NEXT_PUBLIC_FIREBASE_PROJECT_ID o VERTEX_AI_SEARCH_DATA_STORE_ID.");
  // En producción deberías retornar un error HTTP aquí o manejar de forma segura.
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

    const geminiResponse = await generativeModel.generateContent(prompt);
    const geminiText = geminiResponse.response.candidates[0]?.content?.parts[0]?.text;

    console.log('🔍 Respuesta cruda desde Vertex AI (Gemini - Análisis):', geminiText);

    // Intentar parsear el JSON de la respuesta de Gemini
    try {
        // Limpiar el texto de Gemini para asegurar que sea JSON válido
        // Busca el primer '{' y el último '}' para extraer el JSON
        const jsonString = geminiText.substring(geminiText.indexOf('{'), geminiText.lastIndexOf('}') + 1);

        geminiResponseJson = JSON.parse(jsonString);

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


    // 🔍 Paso 2: Decidir la acción basada en la respuesta de Gemini
    if (action === "clarify") {
        // Si Gemini indica que necesita clarificación, respondemos con su pregunta
        conversationalResponse = clarificationQuestion;
        propertyResults = []; // No hay resultados de búsqueda en este caso

        console.log("💬 Gemini requiere clarificación:", conversationalResponse);

        return new Response(
          JSON.stringify({ conversationalResponse, propertyResults, action: "clarify", extractedConcepts: geminiResponseJson?.extractedConcepts || [] }), // Incluimos la acción y conceptos
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );

    } else { // action === "search"
        // Si Gemini indica que se puede buscar, construimos la solicitud de búsqueda

        const searchQueryParams = geminiResponseJson.filters || {}; // Usamos los filtros proporcionados por Gemini
        const vertexAiSearchQuery = geminiResponseJson.searchQuery || userQuery; // Usamos el searchQuery optimizado o el original

        console.log("🔎 Parámetros de filtro extraídos por Gemini:", searchQueryParams);
        console.log("📝 Query para Vertex AI Search:", vertexAiSearchQuery);

        // Construimos el filtro solo con los parámetros que Gemini puso en 'filters'
        const filterString = buildVertexAISearchFilter(searchQueryParams);

        const searchRequest = {
          servingConfig: `${dataStoreName}/servingConfigs/default_serving_config`,
          query: vertexAiSearchQuery, // Usamos el query decidido por Gemini
          queryExpansionSpec: { condition: "AUTO" },
          spellCorrectionSpec: { mode: "AUTO" },
          filter: filterString, // Usamos el filtro construido
        };

        console.log(
          "🛠 Enviando búsqueda a Vertex AI Search:",
          JSON.stringify(searchRequest, null, 2)
        );

        // Realizamos la búsqueda en Vertex AI Search
        const [searchResponse] = await discoveryengineClient.search(
          searchRequest
        );

        // Extraemos los resultados
        propertyResults =
          searchResponse.results
            ?.map((result) => {
              try {
                // Asegurarse de que jsonData existe y es un string antes de parsear
                const rawJson = result.document?.content?.jsonData;
                if (rawJson && typeof rawJson === 'string') {
                   return JSON.parse(rawJson);
                }
                console.warn("⚠️ Resultado de búsqueda con jsonData faltante o inválido:", result);
                return null; // Retornar null si jsonData no es válido
              } catch (e) {
                console.error("❌ Error parseando resultado de búsqueda:", e);
                return null;
              }
            })
            .filter((item) => item !== null) || []; // Filtrar resultados nulos

        console.log(`✅ ${propertyResults.length} propiedades encontradas.`);

        // 🧠 Paso 3: Creamos una respuesta conversacional usando Gemini (basada en resultados o falta de ellos)
        let conversationalPromptForGemini;

        // Incluimos los conceptos extraídos por Gemini en el prompt para que los considere
        // y damos instrucciones para que mencione rentabilidad/inversión si son relevantes
        const extractedConceptsSummary = geminiResponseJson.extractedConcepts && geminiResponseJson.extractedConcepts.length > 0
            ? `Key concepts identified: ${geminiResponseJson.extractedConcepts.join(', ')}.`
            : '';


        if (propertyResults.length > 0) {
          conversationalPromptForGemini = `The user's original request was: "${userQuery}". ${extractedConceptsSummary} I performed a search with the query "${vertexAiSearchQuery}" and found ${
            propertyResults.length
          } properties. Here is a summary of the first few results (up to 3) including relevant fields like location, price, rooms, property type, and any information related to concepts like profitability or investment if available in the data. Ensure the summary is concise but highlights key features relevant to the user's original request:
${JSON.stringify(propertyResults.slice(0, 3), null, 2)}

Based on the original request, the identified concepts (like "investment", "profitability", "beach", "coast"), and the search results, generate a friendly, helpful, and conversational response in **Spanish** to the user.
- Summarize the findings, mentioning how many properties were found.
- Highlight relevant properties from the top results in relation to the user's request (e.g., mention location, price, or features).
- If concepts like "investment" or "profitability" were identified in the user's query or extracted concepts, and the search results contain relevant data (like price, potential rental yield, etc.), mention how these properties might be relevant for investment, referencing the data provided.
- Suggest how they might refine their search if needed.`;
        } else {
           conversationalPromptForGemini = `The user's original request was: "${userQuery}". ${extractedConceptsSummary} I performed a search with the query "${vertexAiSearchQuery}" but found no results matching the criteria or query. Generate a friendly conversational message in **Spanish** informing the user that no properties were found for their request. Based on the concepts identified, suggest trying different criteria, clarifying their needs, or asking about different areas or features.`;
        }

         const conversationalResponseGen = await generativeModel.generateContent(
           conversationalPromptForGemini
         );

         // Extraer el texto de la respuesta conversacional, manejando posibles errores
         conversationalResponse = conversationalResponseGen.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
                                  "Lo siento, no pude generar una respuesta conversacional en este momento."; // Fallback

         console.log("💬 Respuesta conversacional generada:", conversationalResponse);


        // ✅ Paso 4: Respondemos al frontend
        return new Response(
          JSON.stringify({
            conversationalResponse,
            propertyResults, // Enviamos los resultados al frontend
            action: "search", // Indicamos que se realizó una búsqueda
            extractedConcepts: geminiResponseJson.extractedConcepts || [] // Opcional: pasar conceptos al frontend
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
    }


  } catch (error) {
    console.error("❌ Error general en el endpoint /api/chat:", error);

    // Generamos una respuesta de error conversacional usando Gemini
    try {
      const errorPrompt = `There was a technical issue processing the user's request: "${userQuery}". Generate a friendly, conversational message in **Spanish** apologizing for the inconvenience and asking them to try again later.`;
      const errorResponseGen = await generativeModel.generateContent(
        errorPrompt
      );
      // Extraer el texto de la respuesta de error, manejando posibles errores
      conversationalResponse = errorResponseGen.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
                               "Lo siento, ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde."; // Fallback

    } catch (genError) {
      console.error("⚠️ Fallo generando respuesta de error conversacional:", genError);
      conversationalResponse =
        "Lo siento, ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde."; // Fallback final
    }

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        conversationalResponse,
        propertyResults: [],
        action: "error" // Indicamos que hubo un error
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
      // Ejemplos basados en tu esquema y posibles parámetros de Gemini:
      tipo_procedimiento: "tipo_procedimiento",
      fase_procedimiento: "fase_procedimiento",
      fase_actual: "fase_actual",
      rooms: "rooms",
      bathrooms: "bathrooms",
      has_parking: "has_parking",
      uso_predominante_inmueble: "uso_predominante_inmueble",
      // Añade aquí otros mapeos si Gemini extrae otros parámetros filtrables
      // Ejemplo: superficieMin: "superficie_construida_m2",
      // Ejemplo: superficieMax: "superficie_construida_m2",
      // Ejemplo: anoConstruccion: "ano_construccion_inmueble",
      // NOTA: No incluimos municipio_catastro o provincia_catastro aquí a menos que
      // decidas que Gemini solo los ponga en 'filters' si son muy específicos
      // y quieres un filtro estricto. La estrategia actual se apoya más en el query
      // para ubicaciones generales.
       minPrice: "precio_idealista_venta_m2", // Añadido basado en la lógica de rangos
       maxPrice: "precio_idealista_venta_m2", // Añadido basado en la lógica de rangos
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
         filters.push(`${field}: ANY("${value.trim()}")`);
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
