export async function POST({request}) {
  try {
    const {transcript, instructions} = await request.json()

    // Configurar tu API key de OpenAI, Claude, etc.
    const API_KEY = import.meta.env.OPENAI_API_KEY

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente experto en crear contenido de blog. Convierte el dictado del usuario en un post de blog bien estructurado, corrige gramática y estilo, y sugiere un título atractivo y etiquetas relevantes."
          },
          {
            role: "user",
            content: `${instructions}\n\nDictado: ${transcript}`
          }
        ],
        temperature: 0.7
      })
    })

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    // Parsear la respuesta de la IA para extraer título, contenido y tags
    const titleMatch = aiResponse.match(/Título:\s*(.+)/)
    const contentMatch = aiResponse.match(
      /Contenido:\s*([\s\S]+?)(?=\nEtiquetas:|$)/
    )
    const tagsMatch = aiResponse.match(/Etiquetas:\s*(.+)/)

    return new Response(
      JSON.stringify({
        title: titleMatch ? titleMatch[1].trim() : "Nueva entrada",
        content: contentMatch ? contentMatch[1].trim() : aiResponse,
        tags: tagsMatch
          ? tagsMatch[1].split(",").map((tag) => tag.trim())
          : ["general"]
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
  } catch (error) {
    console.error("Error procesando contenido:", error)
    return new Response(JSON.stringify({error: "Error procesando contenido"}), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    })
  }
}
