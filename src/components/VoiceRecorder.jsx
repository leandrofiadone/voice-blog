import React, {useState, useRef, useEffect} from "react"

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedContent, setProcessedContent] = useState("")
  const [postTitle, setPostTitle] = useState("")
  const [postTags, setPostTags] = useState([])
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Verificar compatibilidad con Web Speech API
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      // Configuración del reconocimiento de voz
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "es-ES"

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Error en reconocimiento de voz:", event.error)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    }
  }, [])

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript("")
      setIsRecording(true)
      recognitionRef.current.start()
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  const processWithAI = async () => {
    if (!transcript.trim()) return

    setIsProcessing(true)

    try {
      // Aquí integrarías con tu API de IA preferida (OpenAI, Claude, etc.)
      const response = await fetch("/api/process-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transcript: transcript,
          instructions:
            "Convierte este dictado en un post de blog bien estructurado. Incluye un título atractivo, mejora la gramática y el estilo, y sugiere etiquetas relevantes."
        })
      })

      const data = await response.json()

      setProcessedContent(data.content)
      setPostTitle(data.title)
      setPostTags(data.tags || [])
    } catch (error) {
      console.error("Error procesando con IA:", error)
      // Fallback: usar el transcript directamente
      setProcessedContent(transcript)
      setPostTitle("Nueva entrada de blog")
      setPostTags(["general"])
    }

    setIsProcessing(false)
  }

  const publishPost = async () => {
    if (!processedContent.trim() || !postTitle.trim()) return

    try {
      const response = await fetch("/api/create-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: postTitle,
          content: processedContent,
          tags: postTags,
          date: new Date().toISOString()
        })
      })

      if (response.ok) {
        alert("¡Post publicado exitosamente!")
        // Limpiar el formulario
        setTranscript("")
        setProcessedContent("")
        setPostTitle("")
        setPostTags([])
      } else {
        alert("Error al publicar el post")
      }
    } catch (error) {
      console.error("Error publicando post:", error)
      alert("Error al publicar el post")
    }
  }

  return (
    <div className="space-y-6">
      {/* Controles de grabación */}
      <div className="flex items-center gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}>
          {isRecording ? "🛑 Detener Grabación" : "🎤 Iniciar Grabación"}
        </button>

        {transcript && (
          <button
            onClick={processWithAI}
            disabled={isProcessing}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50">
            {isProcessing ? "⏳ Procesando..." : "🤖 Mejorar con IA"}
          </button>
        )}
      </div>

      {/* Transcript en vivo */}
      {transcript && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Transcript en vivo:</h3>
          <p className="text-gray-700">{transcript}</p>
        </div>
      )}

      {/* Contenido procesado */}
      {processedContent && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Título del post:
            </label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Título del post"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contenido:</label>
            <textarea
              value={processedContent}
              onChange={(e) => setProcessedContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg h-64"
              placeholder="Contenido del post"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Etiquetas:</label>
            <div className="flex flex-wrap gap-2">
              {postTags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={publishPost}
            className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold">
            📝 Publicar Post
          </button>
        </div>
      )}
    </div>
  )
}

export default VoiceRecorder
