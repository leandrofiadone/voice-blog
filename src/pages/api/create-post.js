// src/pages/api/create-post.js
// Este endpoint crea un nuevo post en el blog

import fs from "fs"
import path from "path"

export async function POST({request}) {
  try {
    const {title, content, tags, date} = await request.json()

    // Crear slug del título
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Crear contenido del archivo markdown
    const frontmatter = `---
title: "${title}"
date: ${date}
tags: [${tags.map((tag) => `"${tag}"`).join(", ")}]
draft: false
---

${content}
`

    // Crear directorio de posts si no existe
    const postsDir = path.join(process.cwd(), "src/content/posts")
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, {recursive: true})
    }

    // Escribir archivo
    const filename = `${slug}.md`
    const filepath = path.join(postsDir, filename)
    fs.writeFileSync(filepath, frontmatter)

    return new Response(
      JSON.stringify({
        success: true,
        filename,
        slug
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
  } catch (error) {
    console.error("Error creando post:", error)
    return new Response(JSON.stringify({error: "Error creando post"}), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    })
  }
}
